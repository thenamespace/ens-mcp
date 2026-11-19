import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account } from "../../../schemas/Address.js";
import { PaymentToken } from "../../../schemas/Amount.js";
import { Duration } from "../../../schemas/Duration.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares renewing .eth names. */
export const RenewNames = Tool.make("renew_names", {
  description:
    "Prepare renewing .eth names for the user to sign in their own wallet, e.g. 'Renew nick.eth " +
    "for a year'. Nothing is sent. Anyone can renew any name, while it is registered or in its " +
    "grace period. Paid in USDC by default, or DAI. Returns the steps, cost, what the account " +
    "needs, whether it would succeed, plain signing instructions and the unsigned calls.",
  parameters: Schema.Struct({
    names: Schema.Array(Name)
      .check(Schema.isMinLength(1), Schema.isMaxLength(20))
      .annotate({ description: "1 to 20 .eth names to renew together" }),
    duration: Duration,
    account: Account,
    paymentToken: Schema.optionalKey(PaymentToken),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare a renewal")
  .annotateMerge(ReadsEns);
