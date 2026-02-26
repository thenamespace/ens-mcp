import { Command, Options } from "@effect/cli";
import { NodeContext, NodeRuntime } from "@effect/platform-node";
import { Console, Effect } from "effect";

import { startHttpServer, startStdioServer } from "./app";

const http = Options.boolean("http").pipe(
  Options.withDescription("Start the server using HTTP transport."),
);
const port = Options.integer("port").pipe(
  Options.withDefault(3000),
  Options.withAlias("p"),
  Options.withDescription("The port to listen on when using HTTP transport."),
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

const Layers = NodeContext.layer;

const cli = Command.run(command, {
  name: "ens-mcp",
  version: "v0.0.1",
});

cli(process.argv).pipe(Effect.provide(Layers)).pipe(NodeRuntime.runMain);
