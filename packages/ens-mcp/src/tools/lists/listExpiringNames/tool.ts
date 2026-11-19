import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { AddressOrName } from "../../../schemas/Address.js";
import { ListedName, ListPage, ListParams, Namespace } from "../../../schemas/List.js";
import { Name } from "../../../schemas/Name.js";
import { Timestamp } from "../../../schemas/Timestamp.js";
import { ReadsEns } from "../../annotations.js";

/** Lists names that expire soon. */
export const ListExpiringNames = Tool.make("list_expiring_names", {
  description:
    "List ENS names that expire soon, soonest first, e.g. 'Which of nick.eth's names expire in " +
    "the next 30 days?' or 'What names under ens.eth expire this month?'. Give address for one " +
    "address's names (owned, managed or held through roles); then up to limit names come back " +
    "in one answer, without a cursor. includeGrace adds names that " +
    "already expired but are in their grace period, when they can still be renewed. Results come " +
    "from an indexer and can lag the chain by a few blocks.",
  parameters: Schema.Struct({
    withinDays: Schema.optionalKey(
      Schema.Int.check(Schema.isBetween({ minimum: 1, maximum: 3650 })).annotate({
        description: "Days ahead to look, 1 to 3650. Default: 30",
      }),
    ),
    address: Schema.optionalKey(AddressOrName),
    parent: Schema.optionalKey(Name).annotate({
      description: "Only direct subnames of this name; with no address only",
    }),
    includeGrace: Schema.optionalKey(Schema.Boolean),
    namespace: Schema.optionalKey(Namespace),
    ...ListParams,
  }),
  success: ListPage(ListedName, {
    from: Timestamp.annotate({ description: "Start of the window searched" }),
    to: Timestamp.annotate({ description: "End of the window searched" }),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "List expiring ENS names")
  .annotateMerge(ReadsEns);
