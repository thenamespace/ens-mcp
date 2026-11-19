import { describe, expect, it } from "@effect/vitest";
import { Array as Arr, Effect } from "effect";

import { Indexer } from "@ensforge/sdk/effect";

import { mcpClient } from "../support/client.ts";
import { offlineEns, OfflineEns } from "../support/ens.ts";
import { indexedName } from "../support/indexer.ts";

const page = <A>(items: ReadonlyArray<A>) =>
  Effect.succeed({
    items,
    cursor: null,
    hasMore: false,
    totalCount: null,
    completeness: "full" as const,
  });

const indexer = Indexer.define({
  id: "test",
  search: ({ query }) =>
    page(Arr.map([`${query}.eth`, `${query}s.eth`], (name) => indexedName(name))),
});

const templates = (toolsets: ReadonlyArray<"lookup" | "lists" | "utils">) =>
  mcpClient({ ens: offlineEns({ indexer }), toolsets }).pipe(
    Effect.flatMap((client) => client.listResourceTemplates()),
    Effect.map(({ resourceTemplates }) =>
      Arr.map(resourceTemplates, (template) => template.uriTemplate),
    ),
  );

const completeNick = (client: Effect.Success<ReturnType<typeof mcpClient>>) =>
  client.complete({
    ref: { type: "ref/resource", uri: "ens://name/{name}" },
    argument: { name: "name", value: "nick" },
  });

describe("name and address resources", () => {
  it.effect("follow the enabled toolsets", () =>
    Effect.gen(function* () {
      const [all, lookup, utils] = yield* Effect.all(
        [templates(["lookup", "lists"]), templates(["lookup"]), templates(["utils"])],
        { concurrency: "unbounded" },
      );

      expect(all).toEqual(
        expect.arrayContaining([
          "ens://name/{name}",
          "ens://name/{name}/details",
          "ens://name/{name}/subnames",
          "ens://name/{name}/history",
          "ens://address/{address}",
        ]),
      );
      expect(lookup).not.toContain("ens://name/{name}/subnames");
      expect(utils).not.toContain("ens://name/{name}");
    }),
  );

  it.effect("complete names from the indexer, and offer nothing without one", () =>
    Effect.gen(function* () {
      const withIndexer = yield* mcpClient({ ens: offlineEns({ indexer }), toolsets: ["lookup"] });
      const without = yield* mcpClient({ ens: OfflineEns, toolsets: ["lookup"] });

      const suggested = yield* completeNick(withIndexer);
      const none = yield* completeNick(without);

      expect(suggested.completion.values).toEqual(["nick.eth", "nicks.eth"]);
      expect(none.completion.values).toEqual([]);
    }),
  );

  it.effect("report an invalid name with its code and hint", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["lookup"] });

      const error = yield* Effect.flip(client.readResource({ uri: "ens://name/x..eth" }));

      expect(error.message).toMatch(/^INVALID_NAME: .+ Check the spelling/);
    }),
  );
});
