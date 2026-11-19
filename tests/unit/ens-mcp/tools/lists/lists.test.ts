import { describe, expect, it } from "@effect/vitest";
import { Effect, String as Str } from "effect";
import { TestClock } from "effect/testing";

import { Indexer } from "@ensforge/sdk/effect";

import { mcpClient } from "../../support/client.ts";
import { offlineEns, OfflineEns } from "../../support/ens.ts";
import { indexedName } from "../../support/indexer.ts";

const owner = "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5";
const day = 86_400n;

// Tests run on Effect's test clock, which starts at Unix time 0.
describe("lists tools", () => {
  it.effect("are not offered without an indexer", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["lists"] });

      const { tools } = yield* client.listTools();

      expect(tools).toEqual([]);
    }),
  );

  it.effect("return a cursor only while pages remain, and why an answer is partial", () =>
    Effect.gen(function* () {
      const indexer = Indexer.define({
        id: "test",
        search: () =>
          Effect.succeed({
            items: [indexedName("nick.eth", { expiresAt: 10n * day })],
            cursor: "next",
            hasMore: true,
            totalCount: null,
            completeness: "partial",
            unsupportedReason: "Labels with unknown preimages are left out.",
          }),
      });
      const client = yield* mcpClient({ ens: offlineEns({ indexer }), toolsets: ["lists"] });

      const result = yield* client.callTool({ name: "search_names", arguments: { query: "nick" } });

      expect(result.structuredContent).toEqual({
        items: [
          {
            name: "nick.eth",
            status: "active",
            owner,
            expiresAt: "1970-01-11T00:00:00.000Z",
            daysLeft: 10,
          },
        ],
        cursor: "next",
        partial: "Labels with unknown preimages are left out.",
      });
    }),
  );

  it.effect("list an address's names expiring in the window, soonest first", () =>
    Effect.gen(function* () {
      const relation = {
        relations: ["owner"],
        isPrimary: false,
        migratedAt: null,
        recordCount: null,
        subnameCount: null,
      } as const;
      const indexer = Indexer.define({
        id: "test",
        getNamesForAddress: () =>
          Effect.succeed({
            items: [
              { ...indexedName("lapsed.eth", { expiresAt: 50n * day }), ...relation },
              { ...indexedName("soon.eth", { expiresAt: 105n * day }), ...relation },
              { ...indexedName("later.eth", { expiresAt: 120n * day }), ...relation },
              { ...indexedName("next-year.eth", { expiresAt: 500n * day }), ...relation },
            ],
            cursor: null,
            hasMore: false,
            totalCount: null,
          }),
      });
      const client = yield* mcpClient({ ens: offlineEns({ indexer }), toolsets: ["lists"] });
      yield* TestClock.adjust("100 days");

      const result = yield* client.callTool({
        name: "list_expiring_names",
        arguments: { address: owner, withinDays: 30, limit: 1 },
      });

      expect(result.structuredContent).toMatchObject({
        items: [{ name: "soon.eth", daysLeft: 5 }],
        partial: "More than 1 names match; shorten withinDays or raise limit.",
      });
    }),
  );

  it.effect("summarise history events and drop duplicate registrations", () =>
    Effect.gen(function* () {
      const event = {
        id: "",
        kind: null,
        name: "nick.eth",
        namespace: "ens",
        subject: null,
        registrationId: null,
        contract: null,
        blockNumber: 100n,
        timestamp: 0n,
        transactionHash: "0xab",
        logIndex: 0,
      } as const;
      const registered = {
        ...event,
        type: "registration",
        action: "registration_granted",
        data: { actionId: "1", registrant: Str.toLowerCase(owner), expiresAt: "864000" },
      } as const;
      const indexer = Indexer.define({
        id: "test",
        getHistory: () =>
          Effect.succeed({
            items: [
              { ...registered, id: "a" },
              { ...registered, id: "b" },
              {
                ...event,
                id: "c",
                type: "record",
                action: "record_changed",
                data: { key: "text:url", value: "https://ens.domains/" },
              },
            ],
            cursor: null,
            hasMore: false,
            totalCount: null,
          }),
      });
      const client = yield* mcpClient({ ens: offlineEns({ indexer }), toolsets: ["lists"] });

      const result = yield* client.callTool({
        name: "get_name_history",
        arguments: { name: "nick.eth" },
      });

      expect(result.structuredContent).toMatchObject({
        items: [
          { type: "registration", summary: `Registered to ${owner}, expiring 1970-01-11` },
          { type: "record", summary: 'Record text:url set to "https://ens.domains/"' },
        ],
      });
    }),
  );
});
