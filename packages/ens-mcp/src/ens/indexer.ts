import { Array as Arr, type DateTime } from "effect";

import type { IndexedName, Page } from "@ensforge/sdk/indexer";

import { daysUntil, fromUnixSeconds } from "../schemas/Timestamp.js";

/** The indexer paging options for the list tools' `limit` and `cursor` parameters. */
export const pageOptions = (params: {
  readonly limit?: number | undefined;
  readonly cursor?: string | undefined;
}) => ({
  limit: params.limit ?? 25,
  ...(params.cursor === undefined ? {} : { cursor: params.cursor }),
});

/** Expiries at or past this mean the name never expires (indexers report 2^64 - 1). */
const never = 2n ** 63n;

/**
 * An indexer page in the list tools' shape: the items, the cursor while more pages remain, and
 * how fresh and complete the answer is.
 */
export const toListPage = <A, B>(page: Page<A>, toItem: (item: A) => B) => ({
  items: Arr.map(page.items, toItem),
  ...(page.hasMore && page.cursor !== null ? { cursor: page.cursor } : {}),
  ...(page.totalCount === null ? {} : { total: page.totalCount }),
  ...(page.asOf === null ? {} : { asOf: fromUnixSeconds(page.asOf.timestamp) }),
  ...(page.completeness === "full"
    ? {}
    : { partial: page.unsupportedReason ?? `The indexer's answer is ${page.completeness}.` }),
});

/** A name from an indexer in the list tools' `ListedName` shape. */
export const toListedName = (item: IndexedName, now: DateTime.DateTime) => ({
  name: item.name,
  status: item.status ?? "unregistered",
  owner: item.owner,
  ...(item.manager === null || item.manager === item.owner ? {} : { manager: item.manager }),
  ...(item.expiresAt === null || item.expiresAt >= never
    ? {}
    : { expiresAt: fromUnixSeconds(item.expiresAt), daysLeft: daysUntil(item.expiresAt, now) }),
  // The grace period matters only while the name is in it.
  ...(item.status !== "expired" || item.graceEndsAt === null || item.graceEndsAt >= never
    ? {}
    : { graceEndsAt: fromUnixSeconds(item.graceEndsAt) }),
});
