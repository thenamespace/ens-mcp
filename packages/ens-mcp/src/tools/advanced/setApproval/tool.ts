import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares approving or revoking an operator, a name's delegate or a token approval. */
export const SetApproval = Tool.make("set_approval", {
  description:
    "Prepare approving another account to act for the user, or revoking it, for the user to sign " +
    "in their own wallet. Nothing is sent. kind operator: manage every name of the account on a " +
    "contract (e.g. 'Approve 0xabc… as operator on the registry'); delegate: manage one name's " +
    "records; token: move one name's token (ERC-721/1155 approval). An operator has full " +
    "control; double-check the address.",
  parameters: Schema.Struct({
    kind: Schema.Literals(["operator", "delegate", "token"]),
    account: Account,
    to: AddressOrName.annotate({ description: "Account to approve or revoke" }),
    approved: Schema.optionalKey(Schema.Boolean).annotate({
      description: "true (default) to approve, false to revoke",
    }),
    name: Schema.optionalKey(Name).annotate({ description: "The name (delegate and token)" }),
    contract: Schema.optionalKey(
      Schema.Union([Schema.Literals(["registry", "registrar", "wrapper"]), Address]),
    ).annotate({
      description:
        "Operator only: registry (ENS registry), registrar (.eth registrations), wrapper " +
        "(NameWrapper), or an ENSv2 registry or resolver address",
    }),
  }).check(
    Schema.makeFilter(
      (params) =>
        params.kind !== "operator" || params.contract !== undefined || "operator needs contract",
    ),
    Schema.makeFilter(
      (params) =>
        params.kind === "operator" || params.name !== undefined || `${params.kind} needs name`,
    ),
  ),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare an approval")
  .annotateMerge(ReadsEns);
