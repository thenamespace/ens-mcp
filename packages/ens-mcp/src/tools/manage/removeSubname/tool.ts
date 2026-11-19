import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares removing a subname. */
export const RemoveSubname = Tool.make("remove_subname", {
  description:
    "Prepare removing a subname for the user to sign in their own wallet, e.g. 'Delete " +
    "old.alice.eth'. Nothing is sent. The account must control the parent name.",
  parameters: Schema.Struct({
    name: Name.annotate({ description: "Full subname, e.g. old.alice.eth" }),
    account: Account,
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare removing a subname")
  .annotateMerge(ReadsEns);
