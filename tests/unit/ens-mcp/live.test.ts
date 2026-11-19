import { describe, expect, it } from "@effect/vitest";
import { Config, Effect, Layer } from "effect";

import { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";

import { mcpClient } from "./support/client.ts";

// Vitest decides which tests run when the file loads, before any Effect runs.
// oxlint-disable-next-line effecttsgo/process-env
const live = process.env["ENS_MCP_LIVE"] === "1";

// Reads mainnet through ENS_MCP_RPC_URL, or a public RPC when unset.
const MainnetEns = Layer.unwrap(
  Effect.gen(function* () {
    const rpcUrl = yield* Config.option(Config.Redacted("ENS_MCP_RPC_URL"));
    return Ens.layer({ chain: "mainnet", rpcUrl, requireRpc: false, indexer: "none" });
  }),
);

describe.skipIf(!live)("live mainnet (ENS_MCP_LIVE=1)", () => {
  it.live(
    "resolves names, with a missing address as null",
    () =>
      Effect.gen(function* () {
        const client = yield* mcpClient({ ens: MainnetEns });

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

  it.live(
    "reads primary names, profiles, details and permissions",
    () =>
      Effect.gen(function* () {
        const client = yield* mcpClient({ ens: MainnetEns });
        const nick = "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5";

        const [primary, profile, details, permissions] = yield* Effect.all(
          [
            client.callTool({
              name: "get_primary_name",
              arguments: { addresses: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"] },
            }),
            client.callTool({ name: "get_profile", arguments: { name: "nick.eth" } }),
            client.callTool({
              name: "get_name_details",
              arguments: { name: "nick.eth", include: ["fuses", "migration"] },
            }),
            client.callTool({
              name: "get_permissions",
              arguments: { name: "nick.eth", account: nick },
            }),
          ],
          { concurrency: "unbounded" },
        );

        expect(primary.structuredContent).toMatchObject({ results: [{ name: "vitalik.eth" }] });
        expect(profile.structuredContent).toMatchObject({
          addresses: { eth: nick },
          texts: { "com.github": "arachnid" },
        });
        expect(details.structuredContent).toMatchObject({ status: "registered", owner: nick });
        expect(permissions.structuredContent).toMatchObject({ can: { setRecords: true } });
      }).pipe(Effect.scoped),
    30_000,
  );
});
