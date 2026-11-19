import { describe, expect, it } from "@effect/vitest";

import { dnsNextStep } from "@thenamespace/ens-mcp/internal/tools/advanced/getDnsStatus/nextStep";

describe("dnsNextStep", () => {
  it("gives the exact TXT record to add for the intended owner", () => {
    expect(
      dnsNextStep({
        name: "example.com",
        action: "set-txt-record",
        dnsOwner: null,
        owner: "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5",
      }),
    ).toContain(
      "add a TXT record at _ens.example.com with the value " +
        "a=0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5, then claim it with claim_dns_name",
    );
  });

  it("falls back to the owner DNS already names, then a placeholder", () => {
    const dnsOwner = "0x983110309620D911731Ac0932219af06091b6744";

    expect(dnsNextStep({ name: "ens.domains", action: "proof-invalid", dnsOwner })).toContain(
      `a=${dnsOwner}`,
    );
    expect(
      dnsNextStep({ name: "example.com", action: "set-txt-record", dnsOwner: null }),
    ).toContain("a=<owner address>");
  });
});
