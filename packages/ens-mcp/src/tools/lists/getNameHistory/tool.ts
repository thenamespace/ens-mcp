import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Hex } from "../../../schemas/Hex.js";
import { ListPage, ListParams } from "../../../schemas/List.js";
import { Name } from "../../../schemas/Name.js";
import { Timestamp } from "../../../schemas/Timestamp.js";
import { ReadsEns } from "../../annotations.js";

const EventType = Schema.Literals([
  "registration",
  "renewal",
  "release",
  "expiry",
  "transfer",
  "authority",
  "resolver",
  "record",
  "primary_name",
  "permission",
  "subregistry",
  "migration",
  "reservation",
  "token",
  "contract",
]);

const Event = Schema.Struct({
  at: Schema.optionalKey(Timestamp),
  type: EventType,
  summary: Schema.String,
  transaction: Schema.optionalKey(Hex),
  block: Schema.optionalKey(Schema.String),
});

/** Reads a name's history. */
export const GetNameHistory = Tool.make("get_name_history", {
  description:
    "Get the history of an ENS name, newest first, e.g. 'When was nick.eth registered, renewed " +
    "or transferred?'. Each event has its time, type, a one-line summary and its transaction. " +
    "Filter by types (e.g. registration, renewal, transfer, resolver, record, migration) and a " +
    "date range. Results come from an indexer and can lag the chain by a few blocks.",
  parameters: Schema.Struct({
    name: Name,
    types: Schema.optionalKey(Schema.Array(EventType)).annotate({
      description: "Only these event types",
    }),
    since: Schema.optionalKey(Schema.DateFromString).annotate({
      description: "Only events at or after this date, ISO 8601, e.g. 2024-01-01",
    }),
    until: Schema.optionalKey(Schema.DateFromString).annotate({
      description: "Only events before this date, ISO 8601",
    }),
    order: Schema.optionalKey(Schema.Literals(["desc", "asc"])).annotate({
      description: "desc (default): newest first; asc: oldest first",
    }),
    ...ListParams,
  }),
  success: ListPage(Event, {}),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Get ENS name history")
  .annotateMerge(ReadsEns);
