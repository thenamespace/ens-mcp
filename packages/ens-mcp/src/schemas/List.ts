import { Schema } from "effect";

import { Address } from "./Address.js";
import { Name } from "./Name.js";
import { Timestamp } from "./Timestamp.js";

/** Paging parameters shared by the list tools. */
export const ListParams = {
  limit: Schema.optionalKey(
    Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 100 })).annotate({
      description: "Items per page, 1 to 100. Default: 25",
    }),
  ),
  cursor: Schema.optionalKey(
    Schema.String.annotate({ description: "cursor from the previous page, to read the next one" }),
  ),
};

/** Which naming system a list reads. */
export const Namespace = Schema.Literals(["ens", "basenames"]).annotate({
  description: "ens (default), or basenames for *.base.eth names on Base",
});

/** A page of results with `fields` beside it, and how fresh and complete the indexer's answer is. */
export const ListPage = <S extends Schema.Top, const Fields extends Schema.Struct.Fields>(
  item: S,
  fields: Fields,
) =>
  Schema.Struct({
    ...fields,
    items: Schema.Array(item),
    cursor: Schema.optionalKey(Schema.String).annotate({
      description: "Pass back as cursor for the next page; absent on the last page",
    }),
    total: Schema.optionalKey(Schema.Int),
    asOf: Schema.optionalKey(
      Timestamp.annotate({ description: "Chain time the indexer's answer reflects" }),
    ),
    partial: Schema.optionalKey(
      Schema.String.annotate({ description: "Why the answer may be incomplete" }),
    ),
  });

/** A name in a list, as an indexer reports it. */
export const ListedName = Schema.Struct({
  name: Name,
  status: Schema.Literals(["active", "expired", "released", "unregistered"]).annotate({
    description:
      "active (registered), expired (in its grace period), released (can be registered again) " +
      "or unregistered",
  }),
  owner: Schema.NullOr(Address),
  manager: Schema.optionalKey(Address).annotate({
    description: "ENSv1 manager, when it differs from the owner",
  }),
  expiresAt: Schema.optionalKey(Timestamp),
  daysLeft: Schema.optionalKey(Schema.Int),
  graceEndsAt: Schema.optionalKey(Timestamp).annotate({
    description: "End of the grace period, while the name is in it",
  }),
});
