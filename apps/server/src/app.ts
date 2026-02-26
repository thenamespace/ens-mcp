import { createServer } from "node:http";

import { McpServer } from "@effect/ai";
import { HttpApiBuilder, HttpRouter, HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeSink, NodeStream } from "@effect/platform-node";
import { Layer, Logger } from "effect";

import { McpLive } from "./mcp";

export const startStdioServer = () =>
  Layer.launch(
    McpServer.layerStdio({
      name: "ENS MCP Server",
      stdin: NodeStream.stdin,
      stdout: NodeSink.stdout,
      version: "0.0.1",
    }).pipe(
      Layer.provideMerge(McpLive),
      Layer.provide(Logger.add(Logger.prettyLogger({ stderr: true }))),
    ),
  );

const McpRouter = McpServer.layerHttp({
  name: "ENS MCP Server",
  path: "/mcp",
  version: "0.0.1",
}).pipe(
  Layer.provideMerge(McpLive),
  Layer.provideMerge(HttpRouter.Default.serve()),
  HttpServer.withLogAddress,
  Layer.provide(
    HttpApiBuilder.middlewareCors({
      allowedHeaders: ["Content-Type", "Authorization", "mcp-protocol-version"],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedOrigins: ["*"],
      credentials: false,
    }),
  ),
);

export const startHttpServer = (port: number) =>
  Layer.launch(
    McpRouter.pipe(
      Layer.provideMerge(NodeHttpServer.layer(createServer, { port })),
    ),
  );
