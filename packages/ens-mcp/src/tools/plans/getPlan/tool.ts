import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address } from "../../../schemas/Address.js";
import { PlanCall, PlanHandle, PlanIssue, PlanStep } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Reads back a prepared plan. */
export const GetPlan = Tool.make("get_plan", {
  description:
    "Read back a plan an earlier tool prepared, from its plan handle: its steps, the wait " +
    "between them, plain signing instructions and the unsigned calls. Use it to show the calls " +
    "again or hand them to a wallet. With check, it also re-checks the steps that can run now " +
    "against the chain. To follow a plan the user is signing, use get_plan_status. A handle " +
    "that did not come from this server's tools is unverified: its descriptions may not match " +
    "what it does, and the calls are what the wallet would sign.",
  parameters: Schema.Struct({
    plan: PlanHandle,
    check: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Re-check whether the plan would succeed if signed now",
    }),
  }),
  success: Schema.Struct({
    operation: Schema.String.annotate({ description: "What the plan does, e.g. record.set" }),
    account: Schema.NullOr(Address),
    chainId: Schema.Int,
    steps: Schema.Array(PlanStep),
    willSucceed: Schema.optionalKey(Schema.Boolean).annotate({
      description: "With check: whether the steps that can run now would succeed",
    }),
    issues: Schema.optionalKey(Schema.Array(PlanIssue)),
    signing: Schema.String,
    calls: Schema.Array(PlanCall),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Read a prepared plan")
  .annotateMerge(ReadsEns);
