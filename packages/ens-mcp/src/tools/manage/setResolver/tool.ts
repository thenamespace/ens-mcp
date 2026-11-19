import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares changing a name's resolver. */
export const SetResolver = Tool.make("set_resolver", {
  description:
    "Prepare changing an ENS name's resolver, the contract that holds its records, for the user " +
    "to sign in their own wallet, e.g. 'Set nick.eth's resolver to the public resolver'. Nothing " +
    "is sent. Records on the old resolver stop resolving.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    resolver: Schema.Union([Schema.Literals(["default", "none"]), Address]).annotate({
      description: "A resolver address, default (the ENSv1 public resolver) or none",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare changing the resolver")
  .annotateMerge(ReadsEns);
