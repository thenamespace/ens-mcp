import { NodeRuntime, NodeStdio } from "@effect/platform-node";
import { Effect, Layer, Logger, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/unstable/ai";

const GreetTool = Tool.make("greetTool", {
  description: "Greet a person",
  failure: Schema.Never,
  parameters: Schema.Struct({
    name: Schema.String.annotate({
      description: "The name of the person to greet",
    }),
  }),
  success: Schema.String,
});

const BaseTools = Toolkit.make(GreetTool);

const BaseToolsHandlers = BaseTools.toLayer(
  Effect.gen(function* () {
    return {
      greetTool: ({ name }) => Effect.succeed(`Hello ${name}!`),
    };
  }),
);

export const McpLive = McpServer.toolkit(BaseTools).pipe(
  Layer.provideMerge(BaseToolsHandlers),
);

const McpRouter = McpServer.layerStdio({
  name: "ENS MCP Server",
  version: "0.0.1",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(NodeStdio.layer),
  Layer.provide(Layer.succeed(Logger.LogToStderr)(true)),
);

Layer.launch(McpRouter).pipe(NodeRuntime.runMain);
