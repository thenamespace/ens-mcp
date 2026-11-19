import { Array as Arr, Effect, Predicate } from "effect";

import { Actions } from "@ensforge/sdk/effect";
import type { IndexedEvent } from "@ensforge/sdk/indexer";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { pageOptions, toListPage } from "../../../ens/indexer.js";
import { fromUnixSeconds } from "../../../schemas/Timestamp.js";
import { summarizeEvent } from "./summary.js";
import type { GetNameHistory } from "./tool.js";

const actionId = (event: IndexedEvent): string | undefined => {
  const id = event.data?.["actionId"];
  return Predicate.isString(id) ? id : undefined;
};

/** Handles `get_name_history`. */
export const getNameHistory = (ens: Ens["Service"]) =>
  Effect.fn("get_name_history")(function* (
    params: typeof GetNameHistory.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetNameHistory.successSchema.Type, EnsToolError> {
    const page = yield* runEns(
      Actions.indexer.getHistory(ens.client, {
        name: params.name,
        ...(params.types === undefined ? {} : { types: params.types }),
        ...(params.since === undefined ? {} : { from: params.since }),
        ...(params.until === undefined ? {} : { to: params.until }),
        ...(params.order === undefined ? {} : { order: params.order }),
        ...pageOptions(params),
      }),
    );

    // ENSv2 records one registration under several roles; the copies share the action ID.
    const events = {
      ...page,
      items: Arr.dedupeWith(
        page.items,
        (a, b) => a.action === b.action && actionId(a) !== undefined && actionId(a) === actionId(b),
      ),
    };

    return toListPage(events, (event) => ({
      ...(event.timestamp === null ? {} : { at: fromUnixSeconds(event.timestamp) }),
      type: event.type,
      summary: summarizeEvent(event),
      ...(event.transactionHash === null ? {} : { transaction: event.transactionHash }),
      ...(event.blockNumber === null ? {} : { block: event.blockNumber.toString() }),
    }));
  });
