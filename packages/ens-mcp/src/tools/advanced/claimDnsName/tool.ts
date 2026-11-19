import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares claiming a DNS name into ENS. */
export const ClaimDnsName = Tool.make("claim_dns_name", {
  description:
    "Prepare claiming a DNS name such as example.com into ENS for the user to sign in their own " +
    "wallet, e.g. 'Import mydomain.xyz into ENS'. Nothing is sent. Fetches the DNSSEC proof; the " +
    "owner is the address in its _ens TXT record. Check readiness first with get_dns_status.",
  parameters: Schema.Struct({
    name: Name.annotate({ description: "DNS name, e.g. example.com" }),
    account: Account,
    resolver: Schema.optionalKey(Address).annotate({
      description: "Resolver to set while claiming (only the DNS owner may)",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare claiming a DNS name")
  .annotateMerge(ReadsEns);
