import { describe, expect, it } from "@effect/vitest";
import { Option, String as Str } from "effect";

import type { Plan } from "@ensforge/sdk/effect";
import {
  commitmentOf,
  nextAction,
  stepStates,
  verifyTool,
} from "@thenamespace/ens-mcp/internal/ens/planStatus";
import { encodeFunctionData, parseAbi } from "viem";

const registrar = "0x253553366Da8546fC250F225fe3d25d0C782303b";

const planWith = (calls: ReadonlyArray<Plan.Call>): Plan => ({
  id: "plan-1",
  operation: "registration.register",
  chainId: 1,
  account: undefined,
  steps: [{ id: "commit", description: "Commit", calls }],
  calls,
  requirements: [],
  warnings: [],
  deploys: [],
});

const mined = (timestamp: bigint) => ({ status: "success" as const, timestamp });

describe("stepStates", () => {
  it("makes only the first step ready before anything is sent", () => {
    expect(stepStates([{ receipts: [] }, { receipts: [], waitSeconds: 61n }], 1000n)).toEqual([
      { state: "ready" },
      { state: "blocked" },
    ]);
  });

  it("holds a step until its wait after the previous step is over", () => {
    const steps = [{ receipts: [mined(1000n)] }, { receipts: [], waitSeconds: 61n }];

    expect(stepStates(steps, 1030n)).toEqual([
      { state: "confirmed", confirmedAt: 1000n },
      { state: "waiting", readyAt: 1061n },
    ]);
    expect(stepStates(steps, 1061n)[1]).toEqual({ state: "ready" });
  });

  it("confirms a step only once every transaction is mined, at the latest one", () => {
    expect(stepStates([{ receipts: [mined(1000n), undefined] }], 2000n)).toEqual([
      { state: "pending" },
    ]);
    expect(stepStates([{ receipts: [mined(1000n), mined(1012n)] }], 2000n)).toEqual([
      { state: "confirmed", confirmedAt: 1012n },
    ]);
  });

  it("reports a reverted step and blocks the ones after it", () => {
    expect(
      stepStates(
        [{ receipts: [{ status: "reverted", timestamp: 1000n }] }, { receipts: [] }],
        2000n,
      ),
    ).toEqual([{ state: "reverted" }, { state: "blocked" }]);
  });
});

describe("nextAction", () => {
  const verifyWith = "get_name_details";

  it("says how long to wait before the next step", () => {
    expect(
      nextAction({
        states: [
          { state: "confirmed", confirmedAt: 1000n, calls: 2 },
          { state: "waiting", readyAt: 1061n, calls: 2 },
        ],
        now: 1021n,
        verifyWith,
      }),
    ).toBe("Wait 40 more seconds, then sign step 2 (2 calls).");
  });

  it("asks for the next signature with the commitment deadline", () => {
    expect(
      nextAction({
        states: [
          { state: "confirmed", confirmedAt: 1000n, calls: 2 },
          { state: "ready", calls: 1 },
        ],
        now: 1100n,
        deadline: "2026-11-20T10:00:00.000Z",
        verifyWith,
      }),
    ).toBe("Sign step 2 (1 call) now, before 2026-11-20T10:00:00.000Z.");
  });

  it("starts the registration again once the commitment expired", () => {
    expect(
      nextAction({
        states: [
          { state: "confirmed", confirmedAt: 1000n, calls: 2 },
          { state: "ready", calls: 2 },
        ],
        now: 100_000n,
        commitmentExpired: true,
        verifyWith,
      }),
    ).toContain("Prepare the registration again with register_name");
  });

  it("explains why the ready step would fail", () => {
    expect(
      nextAction({
        states: [{ state: "ready", calls: 1 }],
        now: 0n,
        issue: "The account lacks the roles.",
        verifyWith,
      }),
    ).toBe("Step 1 would fail if signed now. The account lacks the roles.");
  });

  it("points at the tool that shows a finished change", () => {
    expect(
      nextAction({
        states: [{ state: "confirmed", confirmedAt: 1n, calls: 1 }],
        now: 2n,
        verifyWith,
      }),
    ).toBe("All steps are confirmed. Check the result with get_name_details.");
  });
});

describe("commitmentOf", () => {
  const to = registrar;
  const commitment: `0x${string}` = `0x${Str.repeat(32)("ab")}`;

  it("reads the commitment from the registrar commit call", () => {
    const commit = encodeFunctionData({
      abi: parseAbi(["function commit(bytes32 commitment)"]),
      args: [commitment],
    });

    expect(
      commitmentOf(
        planWith([
          { to, data: "0x095ea7b3", value: 0n },
          { to, data: commit, value: 0n },
        ]),
      ),
    ).toEqual(Option.some(commitment));
  });

  it("finds none in a plan without a commit", () => {
    expect(commitmentOf(planWith([{ to, data: "0x1234", value: 0n }]))).toEqual(Option.none());
  });
});

describe("verifyTool", () => {
  it("names the read tool for each kind of change", () => {
    expect(verifyTool("record.set")).toBe("get_records");
    expect(verifyTool("primaryName.set")).toBe("get_primary_name");
    expect(verifyTool("role.grant")).toBe("get_permissions");
    expect(verifyTool("registration.register")).toBe("get_name_details");
  });
});
