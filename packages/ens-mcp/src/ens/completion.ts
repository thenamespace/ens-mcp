import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "./Ens.js";

/**
 * Up to 10 indexed names starting with what the user typed, for completing a name argument of a
 * resource or prompt. Without an indexer, or when it fails, there are no suggestions.
 */
export const completeName = (ens: Ens["Service"]) => (input: string) =>
  !ens.hasIndexer || input.length === 0
    ? Effect.succeed([])
    : Actions.indexer.search(ens.client, { query: input, limit: 10 }).pipe(
        Effect.map((page) => Arr.map(page.items, (item) => item.name)),
        Effect.orElseSucceed(() => []),
      );
