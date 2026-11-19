import { describe, expect, it } from "@effect/vitest";
import { Effect, Schema } from "effect";

import { Duration, toSeconds } from "@thenamespace/ens-mcp/internal/schemas/Duration";

describe("Duration", () => {
  it("reads lengths in ENS years, months, weeks and days", () => {
    expect(toSeconds("1 year")).toBe(31_536_000n);
    expect(toSeconds("2y")).toBe(63_072_000n);
    expect(toSeconds("6 months")).toBe(15_768_000n);
    expect(toSeconds("2 weeks")).toBe(1_209_600n);
    expect(toSeconds("90 days")).toBe(7_776_000n);
  });

  it.effect("rejects lengths without a unit", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(Schema.decodeEffect(Duration)("365"));

      expect(error.message).toContain("1 year, 6 months");
    }),
  );
});
