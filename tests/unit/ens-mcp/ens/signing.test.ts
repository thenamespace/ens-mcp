import { describe, expect, it } from "@effect/vitest";

import { signingGuide } from "@thenamespace/ens-mcp/internal/ens/signing";

const account = "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5";

describe("signingGuide", () => {
  it("explains a registration's two steps, wait and deadline", () => {
    expect(
      signingGuide({
        account,
        chain: "mainnet",
        steps: [
          { step: 1, calls: 2 },
          { step: 2, calls: 2, waitSeconds: 61n },
        ],
        within: "1 day",
      }),
    ).toBe(
      `Sign step 1 (2 calls, in order) from ${account} on mainnet. Wait at least 61 seconds ` +
        "after step 1 confirms, then sign step 2 (2 calls, in order) within 1 day of step 1, or " +
        "start again.",
    );
  });

  it("chains steps without a wait", () => {
    expect(
      signingGuide({
        account,
        chain: "sepolia",
        steps: [
          { step: 1, calls: 1 },
          { step: 2, calls: 1 },
        ],
      }),
    ).toBe(
      `Sign step 1 (1 call) from ${account} on sepolia. Once step 1 confirms, sign step 2 (1 call).`,
    );
  });
});
