import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { RoleNames, RoleTarget } from "../../../schemas/Permissions.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares granting ENSv2 roles. */
export const GrantRoles = Tool.make("grant_roles", {
  description:
    "Prepare granting ENSv2 roles on a name to another account for the user to sign in their own " +
    "wallet, e.g. 'Let 0xabc… renew alice.eth'. Nothing is sent. ENSv2 names only; " +
    "get_permissions shows the roles an account holds.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    grantee: AddressOrName.annotate({ description: "Who gets the roles: an address or ENS name" }),
    roles: RoleNames,
    target: Schema.optionalKey(RoleTarget),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare granting roles")
  .annotateMerge(ReadsEns);
