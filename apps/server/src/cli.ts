import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
  NodeRuntime,
  NodeTerminal,
} from "@effect/platform-node";
import { Console, Effect, Layer } from "effect";
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

const Layers = NodeChildProcessSpawner.layer.pipe(
  Layer.provideMerge(NodeFileSystem.layer),
  Layer.provideMerge(NodePath.layer),
  Layer.provideMerge(NodeTerminal.layer),
);

const cli = Command.run(command, {
  version: "v0.0.1",
}).pipe(Effect.provide(Layers));

cli.pipe(NodeRuntime.runMain);
