import { Schema } from "effect";

import { Chain } from "../ens/Chain.js";
import { Address } from "./Address.js";
import { Amount } from "./Amount.js";
import { Hex } from "./Hex.js";

/** One step of a plan: calls signed together, after an optional wait. */
export const PlanStep = Schema.Struct({
  step: Schema.Int,
  description: Schema.String,
  calls: Schema.Int,
  waitBefore: Schema.optionalKey(Schema.String),
});

/** One unsigned call of a plan, for the account's wallet. */
export const PlanCall = Schema.Struct({
  step: Schema.Int,
  chainId: Schema.Int,
  to: Address,
  data: Hex,
  value: Schema.String.annotate({ description: "Wei sent with the call" }),
});

/** Why a step of a plan would fail, or failed, with the next step. */
export const PlanIssue = Schema.Struct({
  step: Schema.Int,
  code: Schema.String,
  message: Schema.String,
  hint: Schema.optionalKey(Schema.String),
});

/** A write the server prepared for the user's wallet: what it does, whether it would work, and the calls to sign. */
export const PreparedWrite = Schema.Struct({
  summary: Schema.String,
  account: Address.annotate({ description: "Account that must sign" }),
  chain: Chain,
  willSucceed: Schema.Boolean.annotate({
    description: "Whether the steps that can be checked now would succeed if signed now",
  }),
  issues: Schema.Array(PlanIssue).annotate({ description: "Why a checked step would fail" }),
  requirements: Schema.Array(Schema.String).annotate({
    description: "What the account needs before signing, e.g. a token balance",
  }),
  warnings: Schema.Array(Schema.String),
  cost: Schema.Struct({
    eth: Amount.annotate({ description: "ETH the calls send, besides gas" }),
    gas: Schema.optionalKey(
      Schema.String.annotate({ description: "Gas limit of the steps that can be checked now" }),
    ),
  }),
  steps: Schema.Array(
    Schema.Struct({
      ...PlanStep.fields,
      checked: Schema.Literals(["now", "after earlier steps"]).annotate({
        description: "A step that depends on earlier ones can only be checked once they confirm",
      }),
    }),
  ),
  deploys: Schema.optionalKey(
    Schema.Array(Schema.Struct({ contract: Schema.String, address: Address })).annotate({
      description: "Contracts the plan deploys, at addresses known in advance",
    }),
  ),
  signing: Schema.String.annotate({ description: "How to sign the steps, in plain words" }),
  calls: Schema.Array(PlanCall).annotate({
    description: "Unsigned calls, in order, for the account's wallet",
  }),
  plan: Schema.String.annotate({
    description: "Handle of this plan for get_plan; pass it back unchanged",
  }),
});
