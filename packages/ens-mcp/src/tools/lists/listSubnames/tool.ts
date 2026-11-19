import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { ListedName, ListPage, ListParams } from "../../../schemas/List.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

/** Lists a name's subnames. */
export const ListSubnames = Tool.make("list_subnames", {
  description:
    "List the direct subnames of an ENS name, e.g. 'What subnames does ens.eth have?'. Expired " +
    "subnames are left out unless includeExpired is set. Results come from an indexer and can " +
    "lag the chain by a few blocks.",
  parameters: Schema.Struct({
    name: Name,
    search: Schema.optionalKey(Schema.String).annotate({
      description: "Only subnames whose label starts with this text",
    }),
    sort: Schema.optionalKey(Schema.Literals(["name", "expiry", "registered"])),
    order: Schema.optionalKey(Schema.Literals(["asc", "desc"])),
    includeExpired: Schema.optionalKey(Schema.Boolean),
    ...ListParams,
  }),
  success: ListPage(
    Schema.Struct({
      ...ListedName.fields,
      subnameCount: Schema.optionalKey(Schema.Int).annotate({
        description: "How many subnames this subname has",
      }),
    }),
    {},
  ),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "List subnames")
  .annotateMerge(ReadsEns);
