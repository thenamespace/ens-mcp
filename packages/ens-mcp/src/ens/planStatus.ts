import { Array as Arr, Option, String as Str } from "effect";

import type { Plan } from "@ensforge/sdk/effect";
import { decodeFunctionData, parseAbi, type Hex } from "viem";

const registrarCommit = parseAbi(["function commit(bytes32 commitment)"]);

/** The registration commitment a plan's commit call submits, if it has one. */
export const commitmentOf = (plan: Plan): Option.Option<Hex> =>
  Arr.findFirst(
    Arr.flatMap(plan.steps, (step) => step.calls),
    Option.liftThrowable(
      (call: Plan.Call) => decodeFunctionData({ abi: registrarCommit, data: call.data }).args[0],
    ),
  );

/** The read tool that shows the result of a finished plan. */
export const verifyTool = (operation: string): string => {
  const [domain] = Str.split(operation, ".");
  switch (domain) {
    case "record":
      return "get_records";
    case "primaryName":
      return "get_primary_name";
    case "role":
    case "permission":
    case "approval":
    case "wrapper":
      return "get_permissions";
    case "migration":
      return "get_migration_status";
    case "dns":
      return "get_dns_status";
    default:
      return "get_name_details";
  }
};

/** What the chain says about the transactions the user sent for one step. */
export type ObservedStep = {
  /** Seconds the step must wait after the previous step confirms. */
  readonly waitSeconds?: bigint | undefined;
  /** One entry per transaction sent: its receipt, or `undefined` while it is not mined. */
  readonly receipts: ReadonlyArray<
    { readonly status: "success" | "reverted"; readonly timestamp: bigint } | undefined
  >;
};

/**
 * Where a step stands: `confirmed`, `reverted`, `pending` (sent, not mined), `ready` (can be
 * signed now), `waiting` (its wait is not over) or `blocked` (an earlier step is not confirmed).
 */
export type StepState =
  | { readonly state: "confirmed"; readonly confirmedAt: bigint }
  | { readonly state: "reverted" | "pending" | "ready" | "blocked" }
  | { readonly state: "waiting"; readonly readyAt: bigint };

const stateOf = (
  step: ObservedStep,
  previous: Option.Option<StepState>,
  now: bigint,
): StepState => {
  if (step.receipts.length > 0) {
    if (Arr.some(step.receipts, (receipt) => receipt?.status === "reverted"))
      return { state: "reverted" };
    const mined = Arr.getSomes(Arr.map(step.receipts, Option.fromNullishOr));
    if (mined.length < step.receipts.length) return { state: "pending" };
    return {
      state: "confirmed",
      confirmedAt: Arr.reduce(mined, 0n, (latest, { timestamp }) =>
        timestamp > latest ? timestamp : latest,
      ),
    };
  }

  if (Option.isNone(previous)) return { state: "ready" };
  if (previous.value.state !== "confirmed") return { state: "blocked" };
  const readyAt = previous.value.confirmedAt + (step.waitSeconds ?? 0n);
  return now < readyAt ? { state: "waiting", readyAt } : { state: "ready" };
};

/** The state of each step at chain time `now` (Unix seconds), in order. */
export const stepStates = (
  steps: ReadonlyArray<ObservedStep>,
  now: bigint,
): ReadonlyArray<StepState> =>
  Arr.mapAccum(steps, Option.none<StepState>(), (previous, step) => {
    const state = stateOf(step, previous, now);
    return [Option.some(state), state];
  })[1];

/** What the user should do next, in plain words. */
export const nextAction = (options: {
  readonly states: ReadonlyArray<StepState & { readonly calls: number }>;
  readonly now: bigint;
  /** Why the first unconfirmed step fails, or would fail if signed now, in full sentences. */
  readonly issue?: string | undefined;
  /** The registration commitment ran out before the last step was sent. */
  readonly commitmentExpired?: boolean | undefined;
  /** When the registration commitment runs out, as an ISO date. */
  readonly deadline?: string | undefined;
  /** Tool that shows the finished change. */
  readonly verifyWith: string;
}): string => {
  const index = Arr.findFirstIndex(options.states, ({ state }) => state !== "confirmed");
  if (Option.isNone(index))
    return `All steps are confirmed. Check the result with ${options.verifyWith}.`;

  const number = index.value + 1;
  const step = options.states[index.value];
  const issue = options.issue === undefined ? "" : ` ${options.issue}`;
  switch (step?.state) {
    case "reverted":
      return `Step ${number} reverted on chain.${issue} Prepare the write again.`;
    case "pending":
      return `Step ${number} was sent and is not mined yet; check again in a moment.`;
    case "waiting":
      return `Wait ${step.readyAt - options.now} more seconds, then sign step ${number} (${step.calls} call${step.calls === 1 ? "" : "s"}).`;
    default:
      if (options.commitmentExpired === true)
        return "The registration commitment expired before the last step was sent. Prepare the registration again with register_name.";
      if (options.issue !== undefined) return `Step ${number} would fail if signed now.${issue}`;
      return `Sign step ${number} (${step?.calls ?? 0} call${step?.calls === 1 ? "" : "s"}) now${options.deadline === undefined ? "" : `, before ${options.deadline}`}.`;
  }
};
