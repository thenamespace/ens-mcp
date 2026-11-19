import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address } from "../../../schemas/Address.js";
import { PlanCall, PlanStep } from "../../../schemas/PreparedWrite.js";
import { Computes } from "../../annotations.js";

/** Reads back a prepared plan. */
export const GetPlan = Tool.make("get_plan", {
  description:
    "Read back a plan an earlier tool prepared, from its plan handle: its steps, the wait " +
    "between them, plain signing instructions and the unsigned calls. Use it to show the calls " +
    "again or hand them to a wallet. Works offline.",
  parameters: Schema.Struct({
    plan: Schema.String.annotate({ description: "The plan handle a prepare tool returned" }),
  }),
  success: Schema.Struct({
    operation: Schema.String.annotate({ description: "What the plan does, e.g. record.set" }),
    account: Schema.NullOr(Address),
    chainId: Schema.Int,
    steps: Schema.Array(PlanStep),
    signing: Schema.String,
    calls: Schema.Array(PlanCall),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Read a prepared plan")
  .annotateMerge(Computes);
