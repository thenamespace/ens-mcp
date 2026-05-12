import { createServer } from "node:http";

import { NodeHttpServer, NodeStdio } from "@effect/platform-node";
import { Effect, Layer, Logger } from "effect";
import { McpServer } from "effect/unstable/ai";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";
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
  Layer.provideMerge(
    HttpRouter.middleware(
      (httpEffect) =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const response = yield* httpEffect;
          const body = response.body as {
            _tag: string;
            contentLength?: number;
          };

          if (
            request.method === "POST" &&
            request.url === "/mcp" &&
            response.status === 200 &&
            (body._tag === "Empty" ||
              body._tag === "Stream" ||
              body.contentLength === 0)
          ) {
            const { "content-type": _contentType, ...headers } =
              response.headers;

            return HttpServerResponse.empty({
              headers,
              status: 202,
            });
          }

          return response;
        }),
      { global: true },
    ),
  ),
  Layer.provideMerge(RateLimitMiddleware),
  Layer.provideMerge(
    HttpRouter.cors({
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "mcp-protocol-version",
        "mcp-session-id",
      ],
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedOrigins: ["*"],
      credentials: false,
      exposedHeaders: ["mcp-session-id"],
    }),
  ),
);

export const startHttpServer = (port: number) =>
  Layer.launch(
    HttpRouter.serve(McpRouter).pipe(
      Layer.provideMerge(NodeHttpServer.layer(createServer, { port })),
    ),
  ).pipe(
    Effect.provide(RateLimiter.layer),
    Effect.provide(RateLimiter.layerStoreMemory),
  );
