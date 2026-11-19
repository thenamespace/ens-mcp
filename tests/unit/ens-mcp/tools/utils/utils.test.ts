import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { mcpClient } from "../../support/client.ts";
import { OfflineEns } from "../../support/ens.ts";

describe("utils tools", () => {
  it.effect("normalize_name normalises valid names and explains invalid ones", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["utils"] });

      const result = yield* client.callTool({
        name: "normalize_name",
        arguments: { names: ["Nick.ETH", "x..eth"] },
      });

      expect(result.structuredContent).toMatchObject({
        results: [
          { input: "Nick.ETH", normalized: "nick.eth", labels: ["nick", "eth"], parent: "eth" },
          { input: "x..eth", error: { code: "INVALID_NAME" } },
        ],
      });
    }),
  );

  it.effect("convert_coin_type converts symbols and chain IDs", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["utils"] });

      const fromSymbol = yield* client.callTool({
        name: "convert_coin_type",
        arguments: { coin: "base" },
      });
      const fromChain = yield* client.callTool({
        name: "convert_coin_type",
        arguments: { chainId: 8453 },
      });

      const base = { coinType: "2147492101", symbol: "base", chainId: 8453, evm: true };
      expect(fromSymbol.structuredContent).toEqual(base);
      expect(fromChain.structuredContent).toEqual(base);
    }),
  );

  it.effect("convert_content_hash converts both ways and rejects unknown encodings", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["utils"] });
      const uri = "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
      const hex = "0xe30101701220c3c4733ec8affd06cf9e9ff50ffc6bcd2ec85a6170004bb709669c31de94391a";

      const encoded = yield* client.callTool({ name: "convert_content_hash", arguments: { uri } });
      const decoded = yield* client.callTool({ name: "convert_content_hash", arguments: { hex } });
      const unknown = yield* client.callTool({
        name: "convert_content_hash",
        arguments: { hex: "0x1234" },
      });

      expect(encoded.structuredContent).toMatchObject({ protocol: "ipfs", hex });
      expect(decoded.structuredContent).toMatchObject({ protocol: "ipfs", uri });
      expect(unknown.isError).toBe(true);
    }),
  );
});
