import {
  Array as Arr,
  Console,
  Effect,
  FileSystem,
  Option,
  Path,
  Schema,
  Stream,
  String as Str,
} from "effect";
import { Command } from "effect/cli";
import { ChildProcess, ChildProcessSpawner } from "effect/process";

import { SetupError, ToolFailed } from "../errors.ts";
import { Workspace } from "../services/Workspace.ts";

// Requests a 2026-07-28 client sends without a handshake: discovery, then the tool list.
const meta = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientCapabilities": {},
};
const requests = [
  { jsonrpc: "2.0", id: 1, method: "server/discover", params: { _meta: meta } },
  { jsonrpc: "2.0", id: 2, method: "tools/list", params: { _meta: meta } },
];
const toJson = Schema.encodeEffect(Schema.fromJsonString(Schema.Unknown));

const Response = Schema.Struct({
  id: Schema.Int,
  result: Schema.Struct({
    instructions: Schema.optionalKey(Schema.String),
    // Every field of a tool counts towards what a client loads, so none is dropped.
    tools: Schema.optionalKey(Schema.Array(Schema.Record(Schema.String, Schema.Unknown))),
  }),
});
const decodeResponse = Schema.decodeUnknownResult(Schema.fromJsonString(Response));

const selections = ["lookup", "lists", "utils", "default", "all"] as const;

/** Rough token count: about four characters a token for JSON and English. */
const tokens = (text: string) => Math.round(text.length / 4);

/** Runs the built server with `toolsets` over stdio and returns its instructions and tool list. */
const measure = Effect.fn("tokens.measure")(function* (bin: string, selection: string) {
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const failed = (output: string) =>
    ToolFailed.make({ tool: `ens-mcp --toolsets ${selection}`, output });
  const input = yield* Effect.forEach(
    requests,
    (request) => Effect.map(toJson(request), (line) => `${line}\n`),
    { concurrency: "unbounded" },
  ).pipe(Effect.orDie);

  const handle = yield* spawner
    .spawn(
      ChildProcess.make(
        process.execPath,
        [bin, ...(selection === "default" ? [] : ["--toolsets", selection])],
        {
          // The server answers while stdin stays open; the scope stops it afterwards.
          stdin: { stream: Stream.encodeText(Stream.fromIterable(input)), endOnDone: false },
          stderr: "ignore",
        },
      ),
    )
    .pipe(Effect.mapError((cause) => failed(String(cause))));

  const responses = yield* handle.stdout.pipe(
    Stream.decodeText(),
    Stream.splitLines,
    Stream.filterMap(decodeResponse),
    Stream.take(requests.length),
    Stream.runCollect,
    Effect.timeout("20 seconds"),
    Effect.mapError((cause) => failed(String(cause))),
  );

  const result = (id: number) =>
    Option.map(
      Arr.findFirst(responses, (response) => response.id === id),
      (response) => response.result,
    );
  const tools = Option.getOrElse(
    Option.flatMapNullishOr(result(2), (found) => found.tools),
    () => [],
  );
  return {
    selection,
    instructions: Option.getOrElse(
      Option.flatMapNullishOr(result(1), (found) => found.instructions),
      () => "",
    ),
    tools: tools.length,
    toolsJson: yield* toJson(tools).pipe(Effect.orDie),
  };
}, Effect.scoped);

/**
 * Reports how much context the server takes in a client, per toolset: the tool definitions every
 * client may load and the instructions. A report to inform changes, not a budget.
 */
export const tokensCommand = Command.make("tokens", {}, () =>
  Effect.gen(function* () {
    const workspace = yield* Workspace;
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const bin = path.join(workspace.root, "packages/ens-mcp/dist/bin.js");
    if (!(yield* fs.exists(bin)))
      return yield* SetupError.make({ message: "Build the server first: pnpm build" });

    const results = yield* Effect.forEach(selections, (selection) => measure(bin, selection), {
      concurrency: "unbounded",
    });

    return yield* Console.log(
      Arr.join(
        [
          `${Str.padEnd(10)("toolsets")}${Str.padStart(7)("tools")}${Str.padStart(10)("chars")}${Str.padStart(9)("~tokens")}`,
          ...Arr.map(
            results,
            ({ selection, tools, toolsJson }) =>
              `${Str.padEnd(10)(selection)}${Str.padStart(7)(String(tools))}` +
              `${Str.padStart(10)(String(toolsJson.length))}${Str.padStart(9)(String(tokens(toolsJson)))}`,
          ),
          "",
          ...Arr.flatMap(results, ({ selection, instructions }) =>
            selection === "all"
              ? [`instructions: ${instructions.length} chars, ~${tokens(instructions)} tokens`]
              : [],
          ),
        ],
        "\n",
      ),
    );
  }),
).pipe(Command.withDescription("Report the context the server takes in a client, per toolset"));
