import { Effect } from "effect";

import { simulatePlan } from "@ensforge/sdk/extension";

import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { decodePlan, requirePlanChain } from "../../../ens/PlanHandle.js";
import { planCalls, planSigning, planSteps, simulationIssues } from "../../../ens/prepare.js";
import type { GetPlan } from "./tool.js";

/** Handles `get_plan`. */
export const getPlan = (ens: Ens["Service"]) =>
  Effect.fn("get_plan")(function* (
    params: typeof GetPlan.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPlan.successSchema.Type, EnsToolError> {
    const plan = yield* decodePlan(params.plan);
    if (params.check === true) yield* requirePlanChain(plan, ens.chain);
    const simulation =
      params.check === true ? yield* simulatePlan(ens.client, plan, plan.account) : undefined;

    return {
      operation: plan.operation,
      account: plan.account ?? null,
      chainId: plan.chainId,
      steps: planSteps(plan),
      ...(simulation === undefined
        ? {}
        : { willSucceed: simulation.ok, issues: simulationIssues(plan, simulation.steps) }),
      signing: planSigning(plan, { account: plan.account ?? "the account", chain: ens.chain }),
      calls: planCalls(plan),
    };
  });
