import { DateTime, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { pageOptions, toListedName, toListPage } from "../../../ens/indexer.js";
import type { ListSubnames } from "./tool.js";

/** Handles `list_subnames`. */
export const listSubnames = (ens: Ens["Service"]) =>
  Effect.fn("list_subnames")(function* (
    params: typeof ListSubnames.parametersSchema.Type,
  ): Effect.fn.Return<typeof ListSubnames.successSchema.Type, EnsToolError> {
    const page = yield* runEns(
      Actions.indexer.getSubnames(ens.client, {
        name: params.name,
        ...(params.search === undefined ? {} : { search: params.search }),
        ...(params.sort === undefined ? {} : { sort: params.sort }),
        ...(params.order === undefined ? {} : { order: params.order }),
        ...(params.includeExpired === undefined ? {} : { includeExpired: params.includeExpired }),
        ...pageOptions(params),
      }),
    );
    const now = yield* DateTime.now;

    return toListPage(page, (item) => ({
      ...toListedName(item, now),
      ...(item.subnameCount === null ? {} : { subnameCount: item.subnameCount }),
    }));
  });
