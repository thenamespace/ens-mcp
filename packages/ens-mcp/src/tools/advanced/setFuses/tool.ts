import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { FuseName } from "../../../schemas/Permissions.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares burning NameWrapper fuses. */
export const SetFuses = Tool.make("set_fuses", {
  description:
    "Prepare burning NameWrapper fuses on a wrapped name for the user to sign in their own " +
    "wallet, e.g. 'Lock alice.eth so it cannot be unwrapped'. Nothing is sent. Burned fuses are " +
    "PERMANENT: they cannot be restored, even by the owner. As the parent's owner, set child to " +
    "burn parent-controlled fuses (such as parentCannotControl) on a subname or extend its " +
    "expiry. get_permissions shows the fuses already burned.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    fuses: Schema.optionalKey(Schema.Array(FuseName)).annotate({ description: "Fuses to burn" }),
    child: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Burn as the parent's owner, on a subname",
    }),
    expiry: Schema.optionalKey(Schema.DateFromString).annotate({
      description: "With child: the subname's new expiry, ISO 8601",
    }),
  }).check(
    Schema.makeFilter(
      (params) =>
        (params.fuses !== undefined && params.fuses.length > 0) ||
        (params.child === true && params.expiry !== undefined) ||
        "Give the fuses to burn (or, with child, a new expiry)",
    ),
    Schema.makeFilter(
      (params) => params.expiry === undefined || params.child === true || "expiry needs child",
    ),
  ),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare burning fuses")
  .annotateMerge(ReadsEns);
