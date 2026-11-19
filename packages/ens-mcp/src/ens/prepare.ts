import { Array as Arr, Effect, Option } from "effect";

import { Actions, type Ensforge, type Errors, type Plan } from "@ensforge/sdk/effect";
import { formatEther } from "viem";

import { describeAmount, toAmount } from "../schemas/Amount.js";
import { describeSeconds } from "../schemas/Duration.js";
import type { PreparedWrite } from "../schemas/PreparedWrite.js";
import type { Ens } from "./Ens.js";
import { runEns, toToolError, type EnsToolError } from "./errors.js";
import { encodePlan } from "./PlanHandle.js";
import { cleanRecordText } from "./recordText.js";
import { signingGuide } from "./signing.js";

/** The planning methods every ensforge write action carries. */
export type Planner<Options> = {
  readonly simulate: (
    client: Ensforge.Client,
    options: Options,
  ) => Effect.Effect<Plan.Simulation, Errors.AnyError>;
  readonly estimateGas: (
    client: Ensforge.Client,
    options: Options,
  ) => Effect.Effect<Plan.Estimate, Errors.AnyError>;
};

type Token = { readonly address: string; readonly symbol: string; readonly decimals: number };

const describeRequirement = (requirement: Plan.Requirement, tokens: ReadonlyArray<Token>) => {
  const token = Arr.findFirst(
    tokens,
    (known) => requirement.token !== undefined && known.address === requirement.token,
  );
  const amount = Option.match(token, {
    onNone: () =>
      requirement.token === undefined
        ? `${formatEther(requirement.amount)} ETH`
        : `${requirement.amount} units of token ${requirement.token}`,
    onSome: (known) => describeAmount(toAmount(requirement.amount, known)),
  });
  return requirement.kind === "balance"
    ? `Hold at least ${amount}`
    : `Approve ${amount} for ${requirement.spender}`;
};

/** The steps of `plan`, numbered from 1, with the wait before each. */
export const planSteps = (plan: Plan) =>
  Arr.map(plan.steps, (step, index) => ({
    step: index + 1,
    // Handles come back from the model, so their text is not trusted.
    description: cleanRecordText(step.description),
    calls: step.calls.length,
    ...(step.waitFor === undefined
      ? {}
      : { waitBefore: `${step.waitFor.seconds} seconds after step ${index} confirms` }),
  }));

/** Every call of `plan`, in order, with its step and chain. */
export const planCalls = (plan: Plan) =>
  Arr.flatMap(plan.steps, (step, index) =>
    Arr.map(step.calls, (call) => ({
      step: index + 1,
      chainId: plan.chainId,
      to: call.to,
      data: call.data,
      value: call.value.toString(),
    })),
  );

/** Why each failed step of a simulation of `plan` fails, with its step number and next step. */
export const simulationIssues = (plan: Plan, steps: Plan.Simulation["steps"]) =>
  Arr.flatMap(steps, (step) => {
    if (step.ok || step.error === undefined) return [];
    const { code, message, hint } = toToolError(step.error);
    const number = Arr.findFirstIndex(plan.steps, ({ id }) => id === step.id).pipe(
      Option.map((index) => index + 1),
      Option.getOrElse(() => 0),
    );
    return [{ step: number, code, message, ...(hint === undefined ? {} : { hint }) }];
  });

/** How to sign `plan` from `account` on `chain`, in plain words. */
export const planSigning = (
  plan: Plan,
  options: {
    readonly account: string;
    readonly chain: string;
    readonly within?: string | undefined;
  },
) =>
  signingGuide({
    ...options,
    steps: Arr.map(plan.steps, (step, index) => ({
      step: index + 1,
      calls: step.calls.length,
      waitSeconds: step.waitFor?.seconds,
    })),
  });

/**
 * Plans a write for `account` without sending anything: ensforge prepares and simulates it, and
 * the result says what it does, whether it would work, what it needs and how to sign it.
 */
export const prepareWrite = Effect.fn("prepareWrite")(function* <Options>(
  ens: Ens["Service"],
  planner: Planner<Options>,
  options: Options & { readonly account: `0x${string}` },
  summary: string,
): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
  // Simulation prepares the plan itself and returns it with each checked step's outcome.
  const simulation = yield* runEns(planner.simulate(ens.client, options));
  const { plan } = simulation;
  // Gas is estimated only for a plan that would succeed. Payment tokens and the registration
  // commitment window come from the registrar.
  const needsRegistrar =
    plan.operation === "registration.register" ||
    Arr.some(plan.requirements, (requirement) => requirement.token !== undefined);
  const [gas, registration] = yield* Effect.all(
    [
      simulation.ok
        ? Effect.asSome(runEns(planner.estimateGas(ens.client, options)))
        : Effect.succeedNone,
      needsRegistrar
        ? Effect.asSome(runEns(Actions.registration.getParameters(ens.client, {})))
        : Effect.succeedNone,
    ],
    { concurrency: "unbounded" },
  );
  const tokens = Option.match(registration, {
    onNone: () => [],
    onSome: (parameters) => parameters.paymentTokens,
  });

  const checked = new Set(Arr.map(simulation.steps, (step) => step.id));
  const steps = Arr.map(planSteps(plan), (step, index) => ({
    ...step,
    checked: Option.match(Arr.get(plan.steps, index), {
      onNone: () => "after earlier steps" as const,
      onSome: ({ id }) => (checked.has(id) ? ("now" as const) : ("after earlier steps" as const)),
    }),
  }));

  return {
    summary,
    account: options.account,
    chain: ens.chain,
    willSucceed: simulation.ok,
    issues: simulationIssues(plan, simulation.steps),
    requirements: Arr.map(plan.requirements, (requirement) =>
      describeRequirement(requirement, tokens),
    ),
    warnings: Arr.map(plan.warnings, (warning) => warning.message),
    cost: {
      eth: toAmount(
        Arr.reduce(plan.calls, 0n, (total, call) => total + call.value),
        {
          symbol: "ETH",
          decimals: 18,
        },
      ),
      ...Option.match(gas, {
        onNone: () => ({}),
        onSome: (estimate) => ({ gas: estimate.gas.toString() }),
      }),
    },
    steps,
    ...(plan.deploys.length === 0 ? {} : { deploys: plan.deploys }),
    signing: planSigning(plan, {
      account: options.account,
      chain: ens.chain,
      within:
        plan.operation === "registration.register"
          ? Option.getOrUndefined(
              Option.map(registration, (parameters) =>
                describeSeconds(parameters.maxCommitmentAge),
              ),
            )
          : undefined,
    }),
    calls: planCalls(plan),
    plan: encodePlan(plan),
  };
});
