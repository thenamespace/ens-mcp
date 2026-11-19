// oxlint-disable-next-line effecttsgo/node-builtin-import -- NodeHttpServer takes Node's server factory
import { createServer } from "node:http";

import { NodeHttpServer } from "@effect/platform-node";
import { Array as Arr, ByteSize, Effect, Layer, Option } from "effect";
import { McpServer } from "effect/ai";
import {
  Headers,
  HttpIncomingMessage,
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/http";

import { Ens } from "../ens/Ens.js";
import { PackageInfo } from "../PackageInfo.js";
import type { Toolset } from "../Toolset.js";
import { serverOptions } from "./options.js";
import { type RateLimit, RateLimitMiddleware } from "./rateLimit.js";
import { registrations } from "./registrations.js";
import { serverCard } from "./serverCard.js";

export interface HttpOptions {
  /** Browser origins allowed to call `/mcp`, or `*` for any; requests without `Origin` always are. */
  readonly allowedOrigins: ReadonlyArray<string>;
  readonly toolsets: ReadonlyArray<Toolset>;
  readonly rateLimit: Option.Option<RateLimit>;
  /** `X-Forwarded-For` entries the hosting infrastructure appends; 0 trusts the TCP peer. */
  readonly proxyHops: number;
}

/**
 * The HTTP routes: MCP over Streamable HTTP at `/mcp`, a page on how to connect at `/`, the server
 * card at `/.well-known/mcp.json`, and `/healthz` for load balancers and container probes.
 */
export const HttpApp = (options: HttpOptions) => {
  const anyOrigin = Arr.contains(options.allowedOrigins, "*");

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
      const Endpoint = McpServer.layerHttp({
        ...server,
        path: "/mcp",
        allowedOrigins: options.allowedOrigins,
        // Subscription streams would hold instances awake; lists only change on redeploy.
        allowSubscriptions: false,
        allowSessionTermination: true,
        registrations: registrations(options.toolsets),
      });
      const Home = HttpRouter.add(
        "GET",
        "/",
        HttpServerResponse.text(
          `ens-mcp ${version}: an MCP server for ENS (Ethereum Name Service) on ${ens.chain}.\n\n` +
            "Connect an MCP client to /mcp on this host over Streamable HTTP.\n" +
            "https://github.com/thenamespace/ens-mcp\n",
        ),
      );
      const ServerCard = HttpRouter.add(
        "GET",
        "/.well-known/mcp.json",
        HttpServerRequest.HttpServerRequest.use((request) =>
          HttpServerResponse.json(
            serverCard({
              version,
              chain: ens.chain,
              toolsets: options.toolsets,
              request,
              proxyHops: options.proxyHops,
            }),
          ),
        ),
      );
      return Layer.mergeAll(
        Option.match(options.rateLimit, {
          onNone: () => Endpoint,
          onSome: (rateLimit) =>
            Endpoint.pipe(
              Layer.provide(RateLimitMiddleware({ rateLimit, proxyHops: options.proxyHops })),
            ),
        }),
        Home,
        ServerCard,
      );
    }),
  );
  const Health = HttpRouter.add("GET", "/healthz", HttpServerResponse.text("ok"));
  const BodyLimit = HttpRouter.middleware(
    (httpEffect) =>
      Effect.provideService(httpEffect, HttpIncomingMessage.MaxBodySize, ByteSize.kibibytes(256)),
    { global: true },
  );
  // Effect checks origins against an exact list, so `*` drops the header before it checks.
  const AnyOrigin = HttpRouter.middleware(
    (httpEffect) =>
      Effect.updateService(httpEffect, HttpServerRequest.HttpServerRequest, (request) =>
        request.modify({ headers: Headers.remove(request.headers, "origin") }),
      ),
    { global: true },
  );
  const Cors = HttpRouter.cors({
    allowedOrigins: anyOrigin ? [] : options.allowedOrigins,
    exposedHeaders: ["mcp-session-id"],
  });

  return Layer.mergeAll(
    Mcp,
    Health,
    BodyLimit,
    ...(anyOrigin ? [AnyOrigin] : []),
    ...(Arr.isReadonlyArrayNonEmpty(options.allowedOrigins) ? [Cors] : []),
  );
};

/** Serves `HttpApp` on `host` and `port`. */
export const HttpServer = (
  options: HttpOptions & { readonly host: string; readonly port: number },
) =>
  // No log line per request: the ingress already logs requests, and tool arguments stay out of logs.
  HttpRouter.serve(HttpApp(options), { disableLogger: true }).pipe(
    Layer.provide(NodeHttpServer.layer(createServer, { host: options.host, port: options.port })),
  );
