import { describe, expect, it } from "@effect/vitest";
import { Array as Arr, Effect, String as Str } from "effect";
import { Base64Url } from "effect/encoding";

import type { Plan } from "@ensforge/sdk/effect";
import { decodePlan, encodePlan } from "@thenamespace/ens-mcp/internal/ens/PlanHandle";
import { deflateSync, strToU8 } from "fflate";

const plan: Plan = {
  id: "plan-1",
  operation: "record.set",
  chainId: 1,
  account: "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5",
  steps: [
    {
      id: "records",
      description: "Set records",
      calls: [{ to: "0xF4f1007EA430848F2fAd60e405A54Fc100fEc341", data: "0x1234", value: 5n }],
    },
  ],
  calls: [{ to: "0xF4f1007EA430848F2fAd60e405A54Fc100fEc341", data: "0x1234", value: 5n }],
  requirements: [],
  warnings: [],
  deploys: [],
};

describe("plan handles", () => {
  it.effect("carry a plan back unchanged", () =>
    Effect.gen(function* () {
      const decoded = yield* decodePlan(encodePlan(plan));

      expect(decoded).toEqual(plan);
    }),
  );

  it.effect("reject anything that is not a handle", () =>
    Effect.gen(function* () {
      const errors = yield* Effect.forEach(
        ["not a handle", "ensplan1.!!!", Str.slice(0, 40)(encodePlan(plan))],
        (handle) => Effect.flip(decodePlan(handle)),
        { concurrency: "unbounded" },
      );

      expect(Arr.map(errors, (error) => error.code)).toEqual([
        "PLAN_INVALID",
        "PLAN_INVALID",
        "PLAN_INVALID",
      ]);
    }),
  );

  it.effect("reject a handle that inflates past any real plan", () =>
    Effect.gen(function* () {
      // 50 MB of whitespace deflates to about 50 KB.
      const bomb = `ensplan1.${Base64Url.encode(deflateSync(strToU8(Str.repeat(50_000_000)(" ")), { level: 9 }))}`;

      const error = yield* Effect.flip(decodePlan(bomb));

      expect(error.code).toBe("PLAN_INVALID");
    }),
  );
});
