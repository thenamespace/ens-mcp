import { DateTime, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { pageOptions, toListedName, toListPage } from "../../../ens/indexer.js";
import type { ListNamesForAddress } from "./tool.js";

/** Handles `list_names_for_address`. */
export const listNamesForAddress = (ens: Ens["Service"]) =>
  Effect.fn("list_names_for_address")(function* (
    params: typeof ListNamesForAddress.parametersSchema.Type,
  ): Effect.fn.Return<typeof ListNamesForAddress.successSchema.Type, EnsToolError> {
    const address = yield* resolveAccount(ens, params.address);

    const page = yield* runEns(
      Actions.indexer.getNamesForAddress(ens.client, {
        address,
        ...(params.relation === undefined ? {} : { relation: params.relation }),
        ...(params.parent === undefined ? {} : { parent: params.parent }),
        ...(params.search === undefined ? {} : { search: params.search }),
        ...(params.sort === undefined ? {} : { sort: params.sort }),
        ...(params.order === undefined ? {} : { order: params.order }),
        ...(params.namespace === undefined ? {} : { namespace: params.namespace }),
        ...pageOptions(params),
      }),
    );
    const now = yield* DateTime.now;

    return {
      address,
      ...toListPage(page, (item) => ({
        ...toListedName(item, now),
        relations: item.relations,
        isPrimary: item.isPrimary,
      })),
    };
  });
