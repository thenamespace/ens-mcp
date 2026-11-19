import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { getIndexerStatus } from "./getIndexerStatus/handler.js";
import { GetIndexerStatus } from "./getIndexerStatus/tool.js";
import { getNameHistory } from "./getNameHistory/handler.js";
import { GetNameHistory } from "./getNameHistory/tool.js";
import { listExpiringNames } from "./listExpiringNames/handler.js";
import { ListExpiringNames } from "./listExpiringNames/tool.js";
import { listNamesForAddress } from "./listNamesForAddress/handler.js";
import { ListNamesForAddress } from "./listNamesForAddress/tool.js";
import { listSubnames } from "./listSubnames/handler.js";
import { ListSubnames } from "./listSubnames/tool.js";
import { searchNames } from "./searchNames/handler.js";
import { SearchNames } from "./searchNames/tool.js";

const ListsToolkit = Toolkit.make(
  SearchNames,
  ListNamesForAddress,
  ListSubnames,
  GetNameHistory,
  ListExpiringNames,
  GetIndexerStatus,
);

const Registration = McpServer.toolkit(ListsToolkit).pipe(
  Layer.provide(
    ListsToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return {
          search_names: searchNames(ens),
          list_names_for_address: listNamesForAddress(ens),
          list_subnames: listSubnames(ens),
          get_name_history: getNameHistory(ens),
          list_expiring_names: listExpiringNames(ens),
          get_indexer_status: getIndexerStatus(ens),
        };
      }),
    ),
  ),
);

/**
 * The `lists` toolset: search names and list them by address, parent and expiry, with history.
 * Registers nothing when the server runs without an indexer.
 */
export const ListsTools = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;
    return ens.hasIndexer ? Registration : Layer.empty;
  }),
);
