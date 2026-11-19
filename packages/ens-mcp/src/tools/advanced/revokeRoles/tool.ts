import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { RoleNames, RoleTarget } from "../../../schemas/Permissions.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares revoking ENSv2 roles. */
export const RevokeRoles = Tool.make("revoke_roles", {
  description:
    "Prepare revoking ENSv2 roles on a name from an account for the user to sign in their own " +
    "wallet, e.g. 'Stop 0xabc… from changing alice.eth's resolver'. Nothing is sent. ENSv2 " +
    "names only.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    holder: AddressOrName.annotate({ description: "Who loses the roles: an address or ENS name" }),
    roles: RoleNames,
    target: Schema.optionalKey(RoleTarget),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare revoking roles")
  .annotateMerge(ReadsEns);
