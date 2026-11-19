import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";

import { Chains } from "@thenamespace/ens-mcp/internal/ens/Chains";

describe("Chains", () => {
  it.effect("refuses to start without RPC URLs when they are required", () =>
    Effect.gen(function* () {
      const error = yield* Layer.build(
        Chains.layer({
          defaultChain: "mainnet",
          rpcUrls: { mainnet: Option.none(), sepolia: Option.none() },
          requireRpc: true,
          indexer: "none",
        }),
      ).pipe(Effect.flip);

      expect(error.message).toContain("ENS_MCP_MAINNET_RPC_URL");
    }),
  );
});
