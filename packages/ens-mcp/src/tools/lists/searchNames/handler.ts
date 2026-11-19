import { DateTime, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { pageOptions, toListedName, toListPage } from "../../../ens/indexer.js";
import type { SearchNames } from "./tool.js";

/** Handles `search_names`. */
export const searchNames = (ens: Ens["Service"]) =>
  Effect.fn("search_names")(function* (
    params: typeof SearchNames.parametersSchema.Type,
  ): Effect.fn.Return<typeof SearchNames.successSchema.Type, EnsToolError> {
    const page = yield* runEns(
      Actions.indexer.search(ens.client, {
        query: params.query,
        ...(params.match === undefined ? {} : { match: params.match }),
        ...(params.namespace === undefined ? {} : { namespace: params.namespace }),
        ...pageOptions(params),
      }),
    );
    const now = yield* DateTime.now;

    return toListPage(page, (item) => toListedName(item, now));
  });
