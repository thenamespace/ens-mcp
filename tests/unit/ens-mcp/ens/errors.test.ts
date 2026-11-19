import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, Fiber, Ref } from "effect";
import { TestClock } from "effect/testing";

import { Errors } from "@ensforge/sdk/effect";
import { runEns, toToolError, tryEns } from "@thenamespace/ens-mcp/internal/ens/errors";

describe("runEns", () => {
  it.effect("retries retryable failures, then reports the tool error", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const action = Ref.update(attempts, (n) => n + 1).pipe(
        Effect.andThen(Effect.fail(new Errors.NetworkError({ code: "RPC_TIMEOUT" }))),
      );

      const fiber = yield* Effect.forkChild(Effect.flip(runEns(action)));
      yield* TestClock.adjust("1 second");
      const error = yield* Fiber.join(fiber);
      const count = yield* Ref.get(attempts);

      expect(count).toBe(3);
      expect(error).toMatchObject({ code: "RPC_TIMEOUT", retryable: true });
    }),
  );

  it.effect("does not retry other failures", () =>
    Effect.gen(function* () {
      const attempts = yield* Ref.make(0);
      const action = Ref.update(attempts, (n) => n + 1).pipe(
        Effect.andThen(
          Effect.fail(new Errors.InvalidInputError({ code: "INVALID_NAME", input: "x..eth" })),
        ),
      );

      const error = yield* Effect.flip(runEns(action));
      const count = yield* Ref.get(attempts);

      expect(count).toBe(1);
      expect(error).toMatchObject({ code: "INVALID_NAME", retryable: false });
      expect(error.hint).toBeTypeOf("string");
    }),
  );
});

describe("toToolError", () => {
  it("gives next steps that name the server's settings", () => {
    const error = toToolError(new Errors.NetworkError({ code: "RATE_LIMITED" }));

    expect(error.hint).toContain("ENS_MCP_RPC_URL");
  });
});

describe("tryEns", () => {
  it.effect("reports thrown ensforge errors and treats anything else as a defect", () =>
    Effect.gen(function* () {
      const invalid = yield* Effect.flip(
        tryEns(() => {
          throw new Errors.InvalidInputError({ code: "INVALID_COIN_TYPE", input: "nope" });
        }),
      );
      const bug = yield* Effect.exit(
        tryEns(() => {
          throw new Error("bug");
        }),
      );

      expect(invalid.code).toBe("INVALID_COIN_TYPE");
      expect(Exit.hasDies(bug)).toBe(true);
    }),
  );
});
