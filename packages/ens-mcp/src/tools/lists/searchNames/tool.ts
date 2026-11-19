import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { ListedName, ListPage, ListParams, Namespace } from "../../../schemas/List.js";
import { ReadsEns } from "../../annotations.js";

/** Searches names by label. */
export const SearchNames = Tool.make("search_names", {
  description:
    "Search ENS names by label, e.g. 'Find names starting with vitalik'. Matches from the start " +
    "of a label by default, or anywhere with match: contains. Set namespace to basenames to " +
    "search *.base.eth names. Results come from an indexer and can lag the chain by a few " +
    "blocks; for one name's authoritative state use get_name_details.",
  parameters: Schema.Struct({
    query: Schema.String.check(Schema.isMinLength(1)).annotate({
      description: "Text to look for in names, e.g. vitalik",
    }),
    match: Schema.optionalKey(Schema.Literals(["prefix", "contains"])).annotate({
      description: "prefix (default): labels starting with the query; contains: anywhere",
    }),
    namespace: Schema.optionalKey(Namespace),
    ...ListParams,
  }),
  success: ListPage(ListedName, {}),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Search ENS names")
  .annotateMerge(ReadsEns);
