import { describe, expect, it } from "@effect/vitest";

import { summarize } from "@thenamespace/ens-mcp/internal/tools/lookup/getNameDetails/summary";

const base = {
  name: "alice.eth",
  ensVersion: "v1",
  namespace: null,
  owner: null,
  wrapped: false,
} as const;

describe("get_name_details summary", () => {
  it("describes each registration state", () => {
    expect(
      summarize({
        ...base,
        status: "registered",
        ensVersion: "v2",
        owner: "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5",
        expiry: { at: "2035-01-09T19:21:46.000Z", daysLeft: 2973 },
        gracePeriodEnd: undefined,
      }),
    ).toBe(
      "alice.eth is registered on ENSv2, owned by 0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5, " +
        "and expires on 2035-01-09 (in 2,973 days).",
    );
    expect(
      summarize({
        ...base,
        status: "registered",
        wrapped: true,
        expiry: undefined,
        gracePeriodEnd: undefined,
      }),
    ).toBe("alice.eth is registered on ENSv1 and wrapped in the NameWrapper, and does not expire.");
    expect(
      summarize({
        ...base,
        status: "grace",
        expiry: { at: "2026-08-01T00:00:00.000Z", daysLeft: -10 },
        gracePeriodEnd: "2026-10-30T00:00:00.000Z",
      }),
    ).toBe(
      "alice.eth expired on 2026-08-01 and is in its grace period until 2026-10-30: it can still " +
        "be renewed, then anyone can register it.",
    );
  });

  it("names where L2 and off-chain names live", () => {
    const basenames = { kind: "l2", id: "basenames", chainId: 8453 } as const;
    expect(
      summarize({
        ...base,
        name: "jesse.base.eth",
        status: "registered",
        ensVersion: "l2",
        namespace: basenames,
        expiry: undefined,
        gracePeriodEnd: undefined,
      }),
    ).toBe("jesse.base.eth is registered on basenames (chain 8453), and does not expire.");
    expect(
      summarize({
        ...base,
        name: "nobody.base.eth",
        status: "available",
        ensVersion: "l2",
        namespace: basenames,
        expiry: undefined,
        gracePeriodEnd: undefined,
      }),
    ).toBe(
      "nobody.base.eth is available on basenames (chain 8453), registered there rather than " +
        "through ENS.",
    );
    expect(
      summarize({
        ...base,
        name: "alice.cb.id",
        status: "external",
        namespace: { kind: "offchain", provider: "Coinbase", parent: "cb.id" },
        expiry: undefined,
        gracePeriodEnd: undefined,
      }),
    ).toBe(
      "alice.cb.id is managed outside ENS's registries, by Coinbase, and cannot be registered " +
        "through ENS.",
    );
  });
});
