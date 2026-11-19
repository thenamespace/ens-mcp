import { Array as Arr, Effect, Schema } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../ens/Ens.js";
import { EnsToolError } from "../ens/errors.js";

/**
 * Resource content: `read`'s result as JSON in `schema`'s encoding, the same as a tool's structured
 * content. MCP reports a failed read by message only, so an ENS error's code and hint go into it.
 */
export const json = <S extends Schema.Codec<unknown, unknown>, R>(
  schema: S,
  read: Effect.Effect<S["Type"], EnsToolError, R>,
) =>
  read.pipe(
    Effect.mapError((error) =>
      EnsToolError.make({
        code: error.code,
        message: `${error.code}: ${error.message}${error.hint === undefined ? "" : ` ${error.hint}`}`,
        retryable: error.retryable,
        docsUrl: error.docsUrl,
      }),
    ),
    Effect.flatMap((value) =>
      Effect.orDie(Schema.encodeEffect(Schema.fromJsonString(schema))(value)),
    ),
  );

/**
 * Up to 10 indexed names starting with what the user typed, for completing a `{name}` argument.
 * Without an indexer, or when it fails, there are no suggestions.
 */
export const completeName = (ens: Ens["Service"]) => (input: string) =>
  !ens.hasIndexer || input.length === 0
    ? Effect.succeed([])
    : Actions.indexer.search(ens.client, { query: input, limit: 10 }).pipe(
        Effect.map((page) => Arr.map(page.items, (item) => item.name)),
        Effect.orElseSucceed(() => []),
      );
