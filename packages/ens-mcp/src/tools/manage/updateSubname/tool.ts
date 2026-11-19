import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares changing a subname. */
export const UpdateSubname = Tool.make("update_subname", {
  description:
    "Prepare changing an existing subname for the user to sign in their own wallet: a new owner " +
    "(ENSv1), resolver or later expiry, e.g. 'Point pay.alice.eth at the public resolver'. " +
    "Nothing is sent. To change its records use set_records; to transfer an ENSv2 subname use " +
    "transfer_name.",
  parameters: Schema.Struct({
    name: Name.annotate({ description: "Full subname, e.g. pay.alice.eth" }),
    account: Account,
    owner: Schema.optionalKey(AddressOrName).annotate({ description: "New owner (ENSv1 only)" }),
    resolver: Schema.optionalKey(Schema.Union([Schema.Literal("none"), Address])).annotate({
      description: "New resolver address, or none to remove it",
    }),
    expiry: Schema.optionalKey(Schema.DateFromString).annotate({
      description: "New expiry, ISO 8601; it can only move later",
    }),
  }).check(
    Schema.makeFilter(
      (params) =>
        params.owner !== undefined ||
        params.resolver !== undefined ||
        params.expiry !== undefined ||
        "Give at least one of owner, resolver or expiry",
    ),
  ),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare changing a subname")
  .annotateMerge(ReadsEns);
