import { Effect, Layer } from "effect";
import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http";
import { RateLimiter } from "effect/unstable/persistence";

export const getClientIp = Effect.gen(function* () {
  const req = yield* HttpServerRequest.HttpServerRequest;

  return req.headers["x-forwarded-for"] ?? req.remoteAddress ?? "unknown";
});

const makeRateLimiter = Effect.gen(function* () {
  const makeLimiter = yield* RateLimiter.makeWithRateLimiter;
  const clientIp = yield* getClientIp;

  return makeLimiter({
    algorithm: "fixed-window",
    key: clientIp,
    limit: 100,
    onExceeded: "fail",
    window: "1 minute",
  });
});

export const RateLimitMiddleware = HttpRouter.middleware()(
  Effect.gen(function* () {
    return (httpEffect) =>
      Effect.gen(function* () {
        const limiter = yield* makeRateLimiter;
        return yield* limiter(httpEffect).pipe(
          Effect.catchTag("RateLimiterError", (e) =>
            Effect.fail(HttpServerResponse.text(e.message, { status: 429 })),
          ),
        );
      });
  }),
  { global: true },
);
