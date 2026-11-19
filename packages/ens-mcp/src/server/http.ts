// oxlint-disable-next-line effecttsgo/node-builtin-import -- NodeHttpServer takes Node's server factory
import { createServer } from "node:http";

import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { McpServer } from "effect/ai";
import { HttpRouter, HttpServerResponse } from "effect/http";

import { Ens } from "../ens/Ens.js";
import { PackageInfo } from "../PackageInfo.js";
import type { Toolset } from "../Toolset.js";
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
  readonly toolsets: ReadonlyArray<Toolset>;
}) => {
  const Mcp = Layer.unwrap(
    Effect.gen(function* () {
      const { version } = yield* PackageInfo;
      const ens = yield* Ens;
      const server = serverOptions({
        version,
        chain: ens.chain,
        toolsets: options.toolsets,
        hasIndexer: ens.hasIndexer,
      });
      return McpServer.layerHttp({
        ...server,
        path: "/mcp",
        allowedOrigins: options.allowedOrigins,
        registrations: registrations(options.toolsets),
      });
    }),
  );
  const Health = HttpRouter.add("GET", "/healthz", HttpServerResponse.text("ok"));

  return HttpRouter.serve(Layer.mergeAll(Mcp, Health)).pipe(
    Layer.provide(NodeHttpServer.layer(createServer, { host: options.host, port: options.port })),
  );
};
