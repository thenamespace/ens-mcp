import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares unwrapping a wrapped ENSv1 name. */
export const UnwrapName = Tool.make("unwrap_name", {
  description:
    "Prepare unwrapping a wrapped ENSv1 name for the user to sign in their own wallet, e.g. " +
    "'Unwrap alice.eth'. Nothing is sent. Not possible once cannotUnwrap is burned.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "Owner after unwrapping. Default: the name's current holder",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare unwrapping a name")
  .annotateMerge(ReadsEns);
