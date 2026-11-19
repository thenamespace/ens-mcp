import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { mcpClient, readJson } from "../support/client.ts";
import { OfflineEns } from "../support/ens.ts";

describe("reference resources", () => {
  it.effect("describe the chain without revealing the RPC", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const chain = yield* readJson(client, "ens://chain");

      expect(chain).toMatchObject({
        chain: "mainnet",
        chainId: 1,
        ensv1: { contracts: { registry: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" } },
        indexer: null,
        rpc: "configured",
      });
    }),
  );

  it.effect("explain each error code with our hint, and complete codes", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const entry = yield* readJson(client, "ens://errors/insufficient_token_balance");
      const completed = yield* client.complete({
        ref: { type: "ref/resource", uri: "ens://errors/{code}" },
        argument: { name: "code", value: "commitment_" },
      });
      const unknown = yield* Effect.flip(client.readResource({ uri: "ens://errors/NOPE" }));

      expect(entry).toMatchObject({
        code: "INSUFFICIENT_TOKEN_BALANCE",
        category: "funds",
        hint: expect.stringContaining("paymentToken: dai"),
        docsUrl: "https://ensforge.com/docs/reference/errors/INSUFFICIENT_TOKEN_BALANCE",
      });
      expect(completed.completion.values).toEqual([
        "COMMITMENT_EXISTS",
        "COMMITMENT_NOT_FOUND",
        "COMMITMENT_TOO_NEW",
        "COMMITMENT_TOO_OLD",
      ]);
      expect(unknown.message).toContain("Unknown error code NOPE");
    }),
  );

  it.effect("list record keys and coins with their coin types", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const records = yield* readJson(client, "ens://records");

      expect(records).toHaveProperty(
        "coins",
        expect.arrayContaining([
          { symbol: "eth", coinType: "60", chainId: 1 },
          { symbol: "base", coinType: "2147492101", chainId: 8453 },
        ]),
      );
    }),
  );
});
