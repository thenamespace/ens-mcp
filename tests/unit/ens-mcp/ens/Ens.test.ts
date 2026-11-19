import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, Option } from "effect";

import { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";

describe("Ens", () => {
  it.effect("refuses to start without an RPC URL when one is required", () =>
    Effect.gen(function* () {
      const error = yield* Layer.build(
        Ens.layer({ chain: "mainnet", rpcUrl: Option.none(), requireRpc: true, indexer: "none" }),
      ).pipe(Effect.flip);

      expect(error.message).toContain("ENS_MCP_RPC_URL");
    }),
  );
});
