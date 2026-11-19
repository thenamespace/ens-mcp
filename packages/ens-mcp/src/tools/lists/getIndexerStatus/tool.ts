import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { ReadsEns } from "../../annotations.js";

const Health = Schema.Literals(["ready", "degraded", "stale"]);

/** Reports how current the indexer is. */
export const GetIndexerStatus = Tool.make("get_indexer_status", {
  description:
    "Check the indexer behind the list tools: whether it is ready, degraded or stale, and how " +
    "far behind the chain it is. Use it when list results look out of date.",
  success: Schema.Struct({
    indexer: Schema.String,
    status: Health,
    chains: Schema.Array(
      Schema.Struct({
        chainId: Schema.Int,
        status: Health,
        indexedBlock: Schema.NullOr(Schema.String),
        latestBlock: Schema.NullOr(Schema.String),
        lagBlocks: Schema.NullOr(Schema.Int),
        lagSeconds: Schema.NullOr(Schema.Int),
      }),
    ),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Check the indexer")
  .annotateMerge(ReadsEns);
