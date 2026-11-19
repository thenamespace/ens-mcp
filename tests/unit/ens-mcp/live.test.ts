import { describe, expect, it } from "@effect/vitest";
import { Config, Effect, Layer, Option } from "effect";

import { Chains } from "@thenamespace/ens-mcp/internal/ens/Chains";

import { mcpClient } from "./support/client.ts";

// Vitest decides which tests run when the file loads, before any Effect runs.
// oxlint-disable-next-line effecttsgo/process-env
const live = process.env["ENS_MCP_LIVE"] === "1";

// Reads mainnet through ENS_MCP_MAINNET_RPC_URL, or a public RPC when unset.
const MainnetChains = Layer.unwrap(
  Effect.gen(function* () {
    const rpcUrl = yield* Config.option(Config.Redacted("ENS_MCP_MAINNET_RPC_URL"));
    return Chains.layer({
      defaultChain: "mainnet",
      rpcUrls: { mainnet: rpcUrl, sepolia: Option.none() },
      requireRpc: false,
      indexer: "none",
    });
  }),
);

describe.skipIf(!live)("live mainnet (ENS_MCP_LIVE=1)", () => {
  it.live(
    "resolves names, with a missing address as null",
    () =>
      Effect.gen(function* () {
        const client = yield* mcpClient(MainnetChains);

        const result = yield* client.callTool({
          name: "resolve_name",
          arguments: { names: ["vitalik.eth", "x..eth", "ens-mcp-unregistered-name-0.eth"] },
        });

        expect(result.structuredContent).toMatchObject({
          results: [
            { name: "vitalik.eth", address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" },
            { name: "x..eth", error: { code: "INVALID_NAME" } },
            { name: "ens-mcp-unregistered-name-0.eth", address: null },
          ],
        });
      }).pipe(Effect.scoped),
    30_000,
  );
});
