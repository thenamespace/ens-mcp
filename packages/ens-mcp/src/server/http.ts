// oxlint-disable-next-line effecttsgo/node-builtin-import -- NodeHttpServer takes Node's server factory
import { createServer } from "node:http";

import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { McpServer } from "effect/ai";
import { HttpRouter, HttpServerResponse } from "effect/http";

import { PackageInfo } from "../PackageInfo.js";
import { serverOptions } from "./options.js";
import { registrations } from "./registrations.js";

/**
 * Serves MCP over Streamable HTTP at `/mcp`, with a `/healthz` route for load balancers and
 * container probes.
 */
export const HttpServer = (options: {
  readonly host: string;
  readonly port: number;
  /** Browser origins allowed to call `/mcp`; requests without an `Origin` header are always allowed. */
  readonly allowedOrigins: ReadonlyArray<string>;
}) => {
  const Mcp = Layer.unwrap(
    Effect.gen(function* () {
      const { version } = yield* PackageInfo;
      return McpServer.layerHttp({
        ...serverOptions(version),
        path: "/mcp",
        allowedOrigins: options.allowedOrigins,
        registrations,
      });
    }),
  );
  const Health = HttpRouter.add("GET", "/healthz", HttpServerResponse.text("ok"));

  return HttpRouter.serve(Layer.mergeAll(Mcp, Health)).pipe(
    Layer.provide(NodeHttpServer.layer(createServer, { host: options.host, port: options.port })),
  );
};
