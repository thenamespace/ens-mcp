import { Effect, Layer, Option, Schema } from "effect";
import { McpSchema, McpServer } from "effect/ai";

import { Actions } from "@ensforge/sdk/effect";

import { Ens } from "../ens/Ens.js";
import { runEns } from "../ens/errors.js";
import { Address } from "../schemas/Address.js";
import { Name } from "../schemas/Name.js";
import { listNamesForAddress } from "../tools/lists/listNamesForAddress/handler.js";
import { ListNamesForAddress } from "../tools/lists/listNamesForAddress/tool.js";
import { json } from "./content.js";

const AddressSummary = Schema.Struct({
  address: Address,
  primaryName: Schema.NullOr(Name),
  names: Schema.optionalKey(ListNamesForAddress.successSchema),
});

const address = McpSchema.param("address", Address);

/**
 * An address's primary name, and with `names` (the `lists` toolset and an indexer) the names it
 * holds.
 */
export const AddressResources = (options: { readonly names: boolean }) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const ens = yield* Ens;
      const withNames = options.names && ens.hasIndexer;

      return McpServer.resource`ens://address/${address}`({
        name: "ENS names of an address",
        description: withNames
          ? "An address's primary name and the first 25 names it owns or manages"
          : "An address's primary name",
        mimeType: "application/json",
        content: (_uri, value) =>
          json(
            AddressSummary,
            Effect.gen(function* () {
              const [primaryName, names] = yield* Effect.all(
                [
                  runEns(Actions.primaryName.get(ens.client, { address: value })),
                  withNames
                    ? Effect.asSome(listNamesForAddress(ens)({ address: value }))
                    : Effect.succeedNone,
                ],
                { concurrency: "unbounded" },
              );

              return {
                address: value,
                primaryName,
                ...Option.match(names, { onNone: () => ({}), onSome: (page) => ({ names: page }) }),
              };
            }),
          ),
      });
    }),
  );
