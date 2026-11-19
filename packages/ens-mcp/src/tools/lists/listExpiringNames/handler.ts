import { Array as Arr, DateTime, Duration, Effect, Stream } from "effect";

import { Actions, Indexer } from "@ensforge/sdk/effect";
import type { AddressName } from "@ensforge/sdk/indexer";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { pageOptions, toListedName, toListPage } from "../../../ens/indexer.js";
import type { ListExpiringNames } from "./tool.js";

// The longest grace period: 90 days for ENSv1 .eth names (ENSv2 names have a shorter one).
const gracePeriod = Duration.days(90);

// An address's names are scanned in expiry order, at most this many pages of 100.
const maxPages = 10;

const seconds = (time: DateTime.DateTime) =>
  BigInt(Math.floor(DateTime.toEpochMillis(time) / 1000));

/** Handles `list_expiring_names`. */
export const listExpiringNames = (ens: Ens["Service"]) =>
  Effect.fn("list_expiring_names")(function* (
    params: typeof ListExpiringNames.parametersSchema.Type,
  ): Effect.fn.Return<typeof ListExpiringNames.successSchema.Type, EnsToolError> {
    const now = yield* DateTime.now;
    const from = params.includeGrace === true ? DateTime.subtractDuration(now, gracePeriod) : now;
    const to = DateTime.add(now, { days: params.withinDays ?? 30 });
    const namespace = params.namespace === undefined ? {} : { namespace: params.namespace };
    const window = { from: DateTime.formatIso(from), to: DateTime.formatIso(to) };

    if (params.address === undefined) {
      const page = yield* runEns(
        Actions.indexer.getNamesByExpiry(ens.client, {
          ...namespace,
          ...pageOptions(params),
          ...(params.parent === undefined ? {} : { parent: params.parent }),
          expiresAfter: DateTime.toDateUtc(from),
          expiresBefore: DateTime.toDateUtc(to),
          sort: "expiry",
          order: "asc",
        }),
      );
      return { ...window, ...toListPage(page, (item) => toListedName(item, now)) };
    }

    // Indexers filter an address's names by expiry only for former owners, so read them in expiry
    // order and keep those in the window, stopping at its end.
    const address = yield* resolveAccount(ens, params.address);
    const limit = params.limit ?? 25;
    const inWindow = (item: AddressName) =>
      item.expiresAt !== null && item.expiresAt >= seconds(from);
    const matching = yield* Indexer.paginate((cursor) =>
      runEns(
        Actions.indexer.getNamesForAddress(ens.client, {
          ...namespace,
          address,
          sort: "expiry",
          order: "asc",
          limit: 100,
          ...(cursor === undefined ? {} : { cursor }),
        }),
      ),
    ).pipe(
      Stream.take(maxPages),
      Stream.flatMap((page) => Stream.fromIterable(page.items)),
      Stream.takeWhile((item) => item.expiresAt === null || item.expiresAt < seconds(to)),
      Stream.filter(inWindow),
      Stream.take(limit + 1),
      Stream.runCollect,
    );

    return {
      ...window,
      items: Arr.map(Arr.take(matching, limit), (item) => toListedName(item, now)),
      ...(matching.length > limit
        ? { partial: `More than ${limit} names match; shorten withinDays or raise limit.` }
        : {}),
    };
  });
