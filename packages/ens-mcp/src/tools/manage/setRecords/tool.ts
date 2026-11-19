import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { hasChanges, RecordChanges } from "../../../schemas/Records.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares setting a name's records. */
export const SetRecords = Tool.make("set_records", {
  description:
    "Prepare setting or deleting an ENS name's records for the user to sign in their own wallet, " +
    "e.g. 'Set alice.eth's twitter to alicedev and its BTC address to bc1…'. Nothing is sent. " +
    "Text records, addresses by coin and the content hash (website); null deletes a record, " +
    "clearFirst removes every record first. Returns the steps, whether the account may make the " +
    "change, plain signing instructions and the unsigned calls.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    ...RecordChanges.fields,
    clearFirst: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Delete every existing record before writing these",
    }),
  }).check(
    Schema.makeFilter(
      (params) =>
        hasChanges(params) ||
        params.clearFirst === true ||
        "Give at least one of texts, addresses, contentHash or clearFirst",
    ),
  ),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare setting records")
  .annotateMerge(ReadsEns);
