import { describe, expect, it } from "@effect/vitest";
import { Deferred, Effect, Layer, Option, Schema, String as Str } from "effect";
import { HttpEffect, HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";

import { PackageInfo } from "@thenamespace/ens-mcp/internal/PackageInfo";
import { HttpApp, type HttpOptions } from "@thenamespace/ens-mcp/internal/server/http";
import { RateLimit } from "@thenamespace/ens-mcp/internal/server/rateLimit";

import { OfflineEns } from "../support/ens.ts";

/** The HTTP app's handler, as one server instance would run it. */
const instance = (options: Partial<HttpOptions> = {}) =>
  HttpRouter.toHttpEffect(
    HttpApp({
      allowedOrigins: [],
      toolsets: ["utils"],
      rateLimit: Option.none(),
      proxyHops: 0,
      ...options,
    }).pipe(
      Layer.provide(OfflineEns),
      Layer.provide(Layer.succeed(PackageInfo, PackageInfo.of({ version: "0.1.0" }))),
    ),
  );

type Handler = Effect.Success<ReturnType<typeof instance>>;

/** What `handler` sends for `request`, with the headers added just before sending. */
const send = (handler: Handler, makeRequest: Effect.Effect<Request, Schema.SchemaError>) =>
  Effect.gen(function* () {
    const request = yield* makeRequest;
    const sent = yield* Deferred.make<HttpServerResponse.HttpServerResponse>();

    yield* HttpEffect.toHandled(handler, (_, response) => Deferred.succeed(sent, response)).pipe(
      Effect.provideService(
        HttpServerRequest.HttpServerRequest,
        HttpServerRequest.fromWeb(request),
      ),
    );

    const response = yield* Effect.map(Deferred.await(sent), (sentResponse) =>
      HttpServerResponse.toWeb(sentResponse),
    );
    const body = yield* Effect.promise(() => response.text());
    return { status: response.status, headers: response.headers, body };
  });

const get = (path: string, init?: RequestInit) =>
  Effect.succeed(new Request(`http://ens-mcp.test${path}`, init));

const mcpPost = (body: unknown, headers: Record<string, string> = {}) =>
  Effect.map(
    Schema.encodeEffect(Schema.fromJsonString(Schema.Unknown))(body),
    (json) =>
      new Request("http://ens-mcp.test/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          ...headers,
        },
        body: json,
      }),
  );

const initialize = (headers: Record<string, string> = {}, clientName = "test") =>
  mcpPost(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: clientName, version: "0" },
      },
    },
    headers,
  );

const discover = (headers: Record<string, string> = {}) =>
  mcpPost(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "server/discover",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientCapabilities": {},
          "io.modelcontextprotocol/clientInfo": { name: "test", version: "0" },
        },
      },
    },
    { "mcp-protocol-version": "2026-07-28", "mcp-method": "server/discover", ...headers },
  );

describe("HTTP server", () => {
  it.effect("tells people who open it how to connect, and answers probes", () =>
    Effect.gen(function* () {
      const handler = yield* instance();

      const home = yield* send(handler, get("/"));
      const health = yield* send(handler, get("/healthz"));

      expect(home.body).toContain("Connect an MCP client to /mcp");
      expect(health.body).toBe("ok");
    }).pipe(Effect.scoped),
  );

  it.effect("describes itself in a server card at the address clients reach it on", () =>
    Effect.gen(function* () {
      const handler = yield* instance({ proxyHops: 1, toolsets: ["lookup", "utils"] });

      const response = yield* send(
        handler,
        get("/.well-known/mcp.json", {
          headers: { host: "ens-mcp.namespace.ninja", "x-forwarded-proto": "https" },
        }),
      );
      const card = yield* Schema.decodeEffect(Schema.fromJsonString(Schema.Unknown))(response.body);

      expect(card).toMatchObject({
        name: "io.github.thenamespace/ens-mcp",
        version: "0.1.0",
        remotes: [
          {
            type: "streamable-http",
            url: "https://ens-mcp.namespace.ninja/mcp",
            supportedProtocolVersions: ["2026-07-28", "2025-11-25"],
          },
        ],
        _meta: { "ninja.namespace/ens-mcp": { chain: "mainnet", toolsets: ["lookup", "utils"] } },
      });
    }).pipe(Effect.scoped),
  );

  it.effect("serves stateless clients without subscriptions", () =>
    Effect.gen(function* () {
      const handler = yield* instance();

      const response = yield* send(handler, discover());

      expect(response.status).toBe(200);
      expect(response.body).toContain('"subscribe":false');
    }).pipe(Effect.scoped),
  );

  it.effect("rejects browser origins it was not given, and accepts any with *", () =>
    Effect.gen(function* () {
      const listed = yield* instance({ allowedOrigins: ["https://app.example"] });
      const any = yield* instance({ allowedOrigins: ["*"] });
      const origin = { origin: "https://elsewhere.example" };

      const rejected = yield* send(listed, discover(origin));
      const accepted = yield* send(any, discover(origin));
      const preflight = yield* send(
        any,
        get("/mcp", {
          method: "OPTIONS",
          headers: { ...origin, "access-control-request-method": "POST" },
        }),
      );

      expect(rejected.status).toBe(403);
      expect(accepted.status).toBe(200);
      expect(accepted.headers.get("access-control-allow-origin")).toBe("*");
      expect(accepted.headers.get("access-control-expose-headers")).toBe("mcp-session-id");
      expect(preflight.status).toBe(204);
    }).pipe(Effect.scoped),
  );

  it.effect("limits each client IP, read from the hop the proxy appended", () =>
    Effect.gen(function* () {
      const handler = yield* instance({
        rateLimit: Option.some({ limit: 2, unit: "min" }),
        proxyHops: 1,
      });

      yield* send(handler, discover({ "x-forwarded-for": "203.0.113.1" }));
      yield* send(handler, discover({ "x-forwarded-for": "203.0.113.1" }));
      // A client cannot pose as someone else by sending its own X-Forwarded-For.
      const limited = yield* send(
        handler,
        discover({ "x-forwarded-for": "198.51.100.9, 203.0.113.1" }),
      );
      const other = yield* send(handler, discover({ "x-forwarded-for": "203.0.113.2" }));

      expect(limited.status).toBe(429);
      expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
      expect(limited.body).toContain('"code":-32000');
      expect(other.status).toBe(200);
    }).pipe(Effect.scoped),
  );

  it.effect("charges more for opening a session, which stays in memory, and caps its size", () =>
    Effect.gen(function* () {
      const handler = yield* instance({
        rateLimit: Option.some({ limit: 20, unit: "min" }),
        proxyHops: 1,
      });
      const from = { "x-forwarded-for": "203.0.113.7" };

      const sessions = yield* Effect.forEach(
        [1, 2, 3],
        () => Effect.map(send(handler, initialize(from)), (response) => response.status),
        { concurrency: 1 },
      );
      const oversized = yield* send(
        handler,
        initialize({ "x-forwarded-for": "203.0.113.8" }, Str.repeat(20_000)("x")),
      );

      expect(sessions).toEqual([200, 200, 429]);
      expect(oversized.status).toBe(413);
    }).pipe(Effect.scoped),
  );

  it.effect("counts IPv6 clients per /64 and refuses requests from no known client", () =>
    Effect.gen(function* () {
      const handler = yield* instance({
        rateLimit: Option.some({ limit: 1, unit: "min" }),
        proxyHops: 1,
      });

      const first = yield* send(handler, discover({ "x-forwarded-for": "2001:db8:1:2::1" }));
      const sameBlock = yield* send(handler, discover({ "x-forwarded-for": "2001:db8:1:2::ffff" }));
      const unknown = yield* send(handler, discover());

      expect(first.status).toBe(200);
      expect(sameBlock.status).toBe(429);
      expect(unknown.status).toBe(400);
    }).pipe(Effect.scoped),
  );

  it.effect("sends a 2025-11-25 session that reaches a restarted server back to initialise", () =>
    Effect.gen(function* () {
      const before = yield* instance();
      const after = yield* instance();

      const initialized = yield* send(before, initialize());
      const session = initialized.headers.get("mcp-session-id") ?? "";
      const listed = (handler: Handler) =>
        send(
          handler,
          mcpPost(
            { jsonrpc: "2.0", id: 2, method: "tools/list" },
            { "mcp-session-id": session, "mcp-protocol-version": "2025-11-25" },
          ),
        );

      const sameServer = yield* listed(before);
      const restarted = yield* listed(after);

      expect(session).not.toBe("");
      expect(sameServer.status).toBe(200);
      expect(restarted.status).toBe(404);
    }).pipe(Effect.scoped),
  );
});

describe("RateLimit", () => {
  it.effect("reads a limit per second, minute or hour", () =>
    Effect.gen(function* () {
      const decode = Schema.decodeUnknownEffect(RateLimit);

      const perMinute = yield* decode("60/min");
      const perSecond = yield* decode("5/s");
      const invalid = yield* Effect.forEach(
        ["60", "0/min", "1.5/s", "60/day", "/min"],
        (text) => Effect.isFailure(decode(text)),
        { concurrency: 1 },
      );

      expect(perMinute).toEqual({ limit: 60, unit: "min" });
      expect(perSecond).toEqual({ limit: 5, unit: "s" });
      expect(invalid).toEqual([true, true, true, true, true]);
    }),
  );
});
