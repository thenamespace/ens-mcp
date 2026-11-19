import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

/** Explains whether a DNS name is in ENS and how to bring it in. */
export const GetDnsStatus = Tool.make("get_dns_status", {
  description:
    "Check whether a DNS name such as example.com is in ENS and what to do to bring it in, e.g. " +
    "'How do I use mydomain.xyz with ENS?'. Returns whether it is imported, its ENS owner, the " +
    "owner its _ens TXT record names, whether its DNSSEC proof verifies, any gasless (offchain) " +
    "resolver set in DNS, and the next step in plain words, including the exact TXT record to " +
    "add. Claim it with claim_dns_name.",
  parameters: Schema.Struct({
    name: Name.annotate({ description: "DNS name, e.g. example.com" }),
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "Who should own it in ENS, to fill in the TXT record to add",
    }),
  }),
  success: Schema.Struct({
    name: Name,
    imported: Schema.Boolean.annotate({ description: "Whether it is in the ENS registry" }),
    owner: Schema.NullOr(Address).annotate({ description: "ENS owner, when imported" }),
    dnsOwner: Schema.NullOr(Address).annotate({
      description: "Owner named by its _ens TXT record (a=0x…)",
    }),
    proofValid: Schema.Boolean.annotate({ description: "Whether its DNSSEC proof verifies" }),
    action: Schema.Literals(["none", "claim", "set-txt-record", "proof-invalid"]),
    offchainResolver: Schema.optionalKey(
      Schema.Struct({ resolver: Schema.String, context: Schema.NullOr(Schema.String) }),
    ).annotate({ description: "Gasless resolver set by an ENS1 TXT record, without claiming" }),
    next: Schema.String,
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Check a DNS name")
  .annotateMerge(ReadsEns);
