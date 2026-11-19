import {
  Array as Arr,
  Duration,
  Effect,
  Layer,
  Option,
  Result,
  Schema,
  SchemaGetter,
  SchemaTransformation,
  String as Str,
} from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
import { IpNetwork, NetAddress } from "effect/net";
import { RateLimiter } from "effect/persistence";

const windows = { s: "1 second", min: "1 minute", h: "1 hour" } as const;
const Unit = Schema.Literals(["s", "min", "h"]);

/** Requests allowed per client IP, such as `60/min`; the window is `s`, `min` or `h`. */
export const RateLimit = Schema.String.pipe(
  // Flags and env vars are plain strings; the parser rejects those not shaped `<limit>/<unit>`.
  Schema.decodeTo(
    Schema.TemplateLiteralParser([
      Schema.NumberFromString.check(Schema.isInt(), Schema.isGreaterThan(0)),
      "/",
      Unit,
    ]),
    SchemaTransformation.passthroughSupertype(),
  ),
  Schema.decodeTo(Schema.Struct({ limit: Schema.Int, unit: Unit }), {
    decode: SchemaGetter.transform(([limit, , unit]) => ({ limit, unit })),
    encode: SchemaGetter.transform(({ limit, unit }) => [limit, "/", unit] as const),
  }),
);
export type RateLimit = typeof RateLimit.Type;

/**
 * The client a request counts against: its IP, from the TCP peer or, with `proxyHops` set, from the
 * entry that many places from the right of `X-Forwarded-For` (entries further left are whatever the
 * client sent, so never trusted). IPv6 clients count per /64, the block one subscriber gets.
 */
export const clientKey = (
  request: HttpServerRequest.HttpServerRequest,
  proxyHops: number,
): Option.Option<string> => {
  const forwarded = Arr.map(Str.split(",")(request.headers["x-forwarded-for"] ?? ""), Str.trim);
  const address =
    proxyHops === 0 ? request.remoteAddress : Arr.get(forwarded, forwarded.length - proxyHops);

  return Option.flatMap(address, (text) =>
    Result.match(NetAddress.ipFromString(text), {
      onFailure: () => Option.none(),
      onSuccess: (ip) => {
        // IPv4 clients can arrive IPv4-mapped (`::ffff:203.0.113.1`).
        const canonical = NetAddress.toCanonical(ip);
        return NetAddress.isIpv6Address(canonical)
          ? Result.match(IpNetwork.fromAddress(canonical, 64), {
              onFailure: () => Option.none(),
              onSuccess: (network) => Option.some(IpNetwork.format(network)),
            })
          : Option.some(NetAddress.formatIp(canonical));
      },
    }),
  );
};

const jsonRpcError = (status: number, message: string, headers: Record<string, string> = {}) =>
  HttpServerResponse.jsonUnsafe(
    { jsonrpc: "2.0", id: null, error: { code: -32000, message } },
    { status, headers },
  );

const InitializeRequest = Schema.fromJsonString(
  Schema.Struct({ method: Schema.Literal("initialize") }),
);

// Effect keeps each 2025-11-25 session, with its initialize request, in memory for the life of the
// instance, so opening one costs ten requests and its request must stay small.
const sessionCost = 10;
const maxInitializeBytes = 16_384;

/**
 * Limits the requests each client makes to the routes it is provided to, with a token bucket per
 * instance: over the limit, 429 with `Retry-After` and a JSON-RPC error.
 */
export const RateLimitMiddleware = (options: {
  readonly rateLimit: RateLimit;
  readonly proxyHops: number;
}) =>
  HttpRouter.middleware(
    Effect.gen(function* () {
      const limiter = yield* RateLimiter.RateLimiter;
      const { limit, unit } = options.rateLimit;

      return (httpEffect) =>
        Effect.gen(function* () {
          const request = yield* HttpServerRequest.HttpServerRequest;
          const key = clientKey(request, options.proxyHops);
          if (Option.isNone(key)) {
            return jsonRpcError(400, "The server cannot tell which client sent this request.");
          }

          // The transport reads the body again; Effect caches it.
          const body =
            request.method === "POST" && request.headers["mcp-session-id"] === undefined
              ? yield* Effect.orElseSucceed(request.text, () => "")
              : "";
          const opensSession = Option.isSome(Schema.decodeOption(InitializeRequest)(body));
          if (opensSession && body.length > maxInitializeBytes) {
            return jsonRpcError(413, "The initialize request is too large.");
          }

          return yield* limiter
            .consume({
              algorithm: "token-bucket",
              limit,
              window: windows[unit],
              key: key.value,
              tokens: opensSession ? Math.min(sessionCost, limit) : 1,
            })
            .pipe(
              Effect.andThen(httpEffect),
              Effect.catchTag("RateLimiterError", ({ reason }) => {
                // The in-memory store cannot fail; serve the request if it ever does.
                if (reason._tag !== "RateLimitExceeded") return httpEffect;
                const seconds = Math.max(1, Math.ceil(Duration.toSeconds(reason.retryAfter)));
                return Effect.succeed(
                  jsonRpcError(
                    429,
                    `Rate limited: ${limit} requests per ${windows[unit]}. Retry after ${seconds} s.`,
                    { "retry-after": `${seconds}` },
                  ),
                );
              }),
            );
        });
    }),
  ).layer.pipe(Layer.provide(RateLimiter.layer), Layer.provide(RateLimiter.layerStoreMemory));
