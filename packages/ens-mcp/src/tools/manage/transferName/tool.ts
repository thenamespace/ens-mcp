import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares transferring a name. */
export const TransferName = Tool.make("transfer_name", {
  description:
    "Prepare transferring an ENS name to another address for the user to sign in their own " +
    "wallet, e.g. 'Send alice.eth to bob.eth'. Nothing is sent. The recipient gets full " +
    "control; double-check the address. For unwrapped ENSv1 .eth names, role: registrant moves " +
    "only the registration and keeps the manager.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    to: AddressOrName.annotate({ description: "Recipient: an address or an ENS name" }),
    role: Schema.optionalKey(Schema.Literals(["owner", "registrant"])).annotate({
      description: "owner (default): everything; registrant: only the .eth registration (ENSv1)",
    }),
    records: Schema.optionalKey(Schema.Literals(["keep", "handover"])).annotate({
      description:
        "ENSv2: keep (default) the sender's access to the name's records, or hand it over",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare a transfer")
  .annotateMerge(ReadsEns);
