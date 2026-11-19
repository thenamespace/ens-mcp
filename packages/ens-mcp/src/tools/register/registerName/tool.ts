import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { PaymentToken } from "../../../schemas/Amount.js";
import { Duration } from "../../../schemas/Duration.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { RecordChanges } from "../../../schemas/Records.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares registering .eth names. */
export const RegisterName = Tool.make("register_name", {
  description:
    "Prepare registering .eth names for the user to sign in their own wallet, e.g. 'Register " +
    "alice.eth for 2 years'. Nothing is sent. Registration takes two signatures at least a " +
    "minute apart (commit, then register) and is paid in USDC by default, or DAI. Can also set " +
    "records and make the name the account's primary name. Returns the steps, cost, what the " +
    "account needs, whether it would succeed, plain signing instructions and the unsigned calls. " +
    "Check availability and price first with check_availability.",
  parameters: Schema.Struct({
    names: Schema.Array(Name)
      .check(Schema.isMinLength(1), Schema.isMaxLength(20))
      .annotate({ description: "1 to 20 .eth names to register together" }),
    duration: Duration,
    account: Account,
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "Who will own the names. Default: the account",
    }),
    records: Schema.optionalKey(RecordChanges).annotate({
      description: "Records to set on every name",
    }),
    setPrimaryName: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Make the (single) name the account's primary name",
    }),
    resolver: Schema.optionalKey(
      Schema.Union([Schema.Literals(["own", "shared", "none"]), Address]),
    ).annotate({
      description:
        "own (default): a new resolver for each name; shared: the account's shared resolver, as " +
        "the ENS app uses; none; or a resolver address",
    }),
    paymentToken: Schema.optionalKey(PaymentToken),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare a registration")
  .annotateMerge(ReadsEns);
