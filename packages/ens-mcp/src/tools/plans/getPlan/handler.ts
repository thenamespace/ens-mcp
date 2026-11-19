import { Effect } from "effect";

import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { decodePlan } from "../../../ens/PlanHandle.js";
import { planCalls, planSigning, planSteps } from "../../../ens/prepare.js";
import type { GetPlan } from "./tool.js";

/** Handles `get_plan`. */
export const getPlan = (ens: Ens["Service"]) =>
  Effect.fn("get_plan")(function* (
    params: typeof GetPlan.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPlan.successSchema.Type, EnsToolError> {
    const plan = yield* decodePlan(params.plan);

    return {
      operation: plan.operation,
      account: plan.account ?? null,
      chainId: plan.chainId,
      steps: planSteps(plan),
      signing: planSigning(plan, { account: plan.account ?? "the account", chain: ens.chain }),
      calls: planCalls(plan),
    };
  });
