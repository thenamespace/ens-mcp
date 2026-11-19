import { describe, expect, it } from "@effect/vitest";

import { instructions } from "@thenamespace/ens-mcp/internal/server/instructions";

describe("instructions", () => {
  it("name the chain and only the tools the server offers", () => {
    const text = instructions({
      chain: "sepolia",
      toolsets: ["lookup", "lists"],
      hasIndexer: false,
    });

    expect(text).toContain("ENS (Ethereum Name Service) on sepolia");
    expect(text).toContain("resolve_name");
    expect(text).not.toContain("search_names");
    expect(text).not.toContain("normalize_name");
  });
});
