import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
  NodeRuntime,
  NodeTerminal,
} from "@effect/platform-node";
import { Console, Effect } from "effect";
import { Command, Flag } from "effect/unstable/cli";

import { startHttpServer, startStdioServer } from "./app";

const http = Flag.boolean("http").pipe(
  Flag.withDescription("Start the server using HTTP transport."),
);
const port = Flag.integer("port").pipe(
  Flag.withDefault(3000),
  Flag.withAlias("p"),
  Flag.withDescription("The port to listen on when using HTTP transport."),
);

const command = Command.make("ens-mcp", { http, port }, ({ http, port }) =>
  Effect.gen(function* () {
    if (http) {
      yield* Console.log("✅ Started ENS MCP Server using HTTP transport");
      yield* startHttpServer(port);
    } else {
      yield* Console.log("✅ Started ENS MCP Server using stdio transport");
      yield* startStdioServer();
    }
  }),
);

const cli = Command.run(command, {
  version: "v0.0.1",
});

cli.pipe(
  Effect.provide(NodeTerminal.layer),
  Effect.provide(NodeChildProcessSpawner.layer),
  Effect.provide(NodePath.layer),
  Effect.provide(NodeFileSystem.layer),
  Effect.scoped,
  NodeRuntime.runMain,
);
