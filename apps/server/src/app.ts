import { createServer } from "node:http";

import { NodeHttpServer, NodeStdio } from "@effect/platform-node";
import { Layer, Logger } from "effect";
import { McpServer } from "effect/unstable/ai";
import { HttpRouter } from "effect/unstable/http";
import { RateLimiter } from "effect/unstable/persistence";

import { RateLimitMiddleware } from "./helpers";
import { McpLive } from "./mcp";

export const startStdioServer = () =>
  Layer.launch(
    McpLive.pipe(
      Layer.provideMerge(
        McpServer.layerStdio({
          name: "ENS MCP Server",
          version: "0.0.1",
        }),
      ),
      Layer.provide(NodeStdio.layer),
      Layer.provide(Layer.succeed(Logger.LogToStderr)(true)),
    ),
  );

const McpRouter = McpLive.pipe(
  Layer.provideMerge(
    McpServer.layerHttp({
      name: "ENS MCP Server",
      path: "/mcp",
      version: "0.0.1",
    }),
  ),
  Layer.provideMerge(RateLimiter.layer),
  Layer.provideMerge(RateLimiter.layerStoreMemory),
  Layer.provideMerge(RateLimitMiddleware),
  Layer.provideMerge(
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
