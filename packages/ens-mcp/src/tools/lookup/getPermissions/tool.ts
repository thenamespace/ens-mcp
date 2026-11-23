import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

const Allowed = Schema.NullOr(Schema.Boolean);

/** Checks what one account may do with a name. */
export const GetPermissions = Tool.make("get_permissions", {
  description:
    "Check what an account may do with an ENS name, e.g. 'Can 0xabc… change the records of " +
    "alice.eth?'. Returns, for each action, true (allowed), false (not allowed) or null " +
    "(unknown): set records, transfer, set the resolver, create or remove subnames, renew, and " +
    "more. Also lists burned NameWrapper fuses and, for ENSv2 names, the account's roles. To see " +
    "who owns or manages the name, use get_name_details.",
  parameters: Schema.Struct({
    name: Name,
    account: Address.annotate({ description: "Address whose permissions to check" }),
  }),
  success: Schema.Struct({
    name: Name,
    account: Address,
    status: Schema.Literals([
      "available",
      "registered",
      "grace",
      "expired",
      "reserved",
      "external",
    ]),
    can: Schema.Struct({
      setRecords: Allowed,
      transfer: Allowed,
      setResolver: Allowed,
      setSubregistry: Allowed.annotate({ description: "Set the ENSv2 registry for subnames" }),
      createSubname: Allowed,
      removeSubname: Allowed,
      renew: Allowed,
      setTtl: Allowed,
      setManager: Allowed.annotate({ description: "Change the ENSv1 manager" }),
      reclaim: Allowed.annotate({ description: "Reclaim ENSv1 management as the registrant" }),
    }),
    fuses: Schema.Array(Schema.String).annotate({
      description: "Burned NameWrapper fuses limiting what anyone can do with the name",
    }),
    roles: Schema.optionalKey(Schema.Array(Schema.String)).annotate({
      description: "The account's ENSv2 roles on the name's registry",
    }),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Check ENS permissions")
  .annotateMerge(ReadsEns);
