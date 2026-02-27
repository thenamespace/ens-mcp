import { createServer } from "node:http";

import { NodeHttpServer, NodeStdio } from "@effect/platform-node";
import { Layer, Logger } from "effect";
import { McpServer } from "effect/unstable/ai";
import { HttpRouter } from "effect/unstable/http";

import { McpLive } from "./mcp";

export const startStdioServer = () =>
  Layer.launch(
    McpServer.layerStdio({
      name: "ENS MCP Server",
      version: "0.0.1",
    }).pipe(
      Layer.provideMerge(McpLive),
      Layer.provide(NodeStdio.layer),
      Layer.provide(Layer.succeed(Logger.LogToStderr)(true)),
    ),
  );

const McpRouter = McpServer.layerHttp({
  name: "ENS MCP Server",
  path: "/mcp",
  version: "0.0.1",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provide(
    HttpRouter.cors({
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedOrigins: ["*"],
      credentials: false,
    }),
  ),
);

export const startHttpServer = (port: number) =>
  Layer.launch(
    HttpRouter.serve(McpRouter).pipe(
      Layer.provideMerge(NodeHttpServer.layer(createServer, { port })),
    ),
  );
