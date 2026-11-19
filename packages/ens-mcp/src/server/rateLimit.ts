import {
  Array as Arr,
  Duration,
  Effect,
  Layer,
  Option,
  Schema,
  SchemaGetter,
  SchemaTransformation,
  String as Str,
} from "effect";
import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/http";
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
 * The client's IP: the TCP peer, or with `proxyHops` set, the entry that many places from the right
 * of `X-Forwarded-For`. The entries further left are whatever the client sent, so never trusted.
 */
export const clientAddress = (
  request: HttpServerRequest.HttpServerRequest,
  proxyHops: number,
): Option.Option<string> => {
  if (proxyHops === 0) return request.remoteAddress;
  const forwarded = Arr.map(Str.split(",")(request.headers["x-forwarded-for"] ?? ""), Str.trim);
  return Option.filter(Arr.get(forwarded, forwarded.length - proxyHops), Str.isNonEmpty);
};

/**
 * Limits the requests each client IP makes to the routes it is provided to, with a token bucket per
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
          const key = Option.getOrElse(clientAddress(request, options.proxyHops), () => "unknown");

          return yield* limiter
            .consume({ algorithm: "token-bucket", limit, window: windows[unit], key })
            .pipe(
              Effect.andThen(httpEffect),
              Effect.catchTag("RateLimiterError", ({ reason }) => {
                // The in-memory store cannot fail; serve the request if it ever does.
                if (reason._tag !== "RateLimitExceeded") return httpEffect;
                const seconds = Math.max(1, Math.ceil(Duration.toSeconds(reason.retryAfter)));
                return Effect.succeed(
                  HttpServerResponse.jsonUnsafe(
                    {
                      jsonrpc: "2.0",
                      id: null,
                      error: {
                        code: -32000,
                        message: `Rate limited: ${limit} requests per ${windows[unit]}. Retry after ${seconds} s.`,
                      },
                    },
                    { status: 429, headers: { "retry-after": `${seconds}` } },
                  ),
                );
              }),
            );
        });
    }),
  ).layer.pipe(Layer.provide(RateLimiter.layer), Layer.provide(RateLimiter.layerStoreMemory));
