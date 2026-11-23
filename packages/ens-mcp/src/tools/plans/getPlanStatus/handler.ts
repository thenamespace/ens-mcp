import { Array as Arr, Effect, Option, Result } from "effect";

import { Actions } from "@ensforge/sdk/effect";
import { Rpc, simulateStep } from "@ensforge/sdk/extension";
import { TransactionNotFoundError, TransactionReceiptNotFoundError, isAddressEqual } from "viem";
import { getBlock, getTransaction, getTransactionReceipt } from "viem/actions";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { decodePlan, requirePlanChain } from "../../../ens/PlanHandle.js";
import { commitmentOf, nextAction, stepStates, verifyTool } from "../../../ens/planStatus.js";
import { simulationIssues } from "../../../ens/prepare.js";
import { fromUnixSeconds } from "../../../schemas/Timestamp.js";
import type { GetPlanStatus } from "./tool.js";

/** Handles `get_plan_status`. */
export const getPlanStatus = (ens: Ens["Service"]) =>
  Effect.fn("get_plan_status")(function* (
    params: typeof GetPlanStatus.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPlanStatus.successSchema.Type, EnsToolError> {
    const plan = yield* decodePlan(params.plan);
    yield* requirePlanChain(plan, ens.chain);

    const transactions = params.transactions ?? [];
    const known = Arr.filter(transactions, ({ step }) => step <= plan.steps.length);
    const unknown = Arr.filter(transactions, ({ step }) => step > plan.steps.length);

    // What the chain knows about each transaction: what it calls, and its receipt once mined.
    const observed = yield* Effect.forEach(
      known,
      Effect.fnUntraced(function* ({ step, hash }) {
        const [transaction, receipt] = yield* Effect.all(
          [
            runEns(
              Rpc.fromPromise(() =>
                getTransaction(ens.client.client(), { hash }).catch((error: unknown) =>
                  error instanceof TransactionNotFoundError ? undefined : Promise.reject(error),
                ),
              ),
            ),
            runEns(
              Rpc.fromPromise(() =>
                getTransactionReceipt(ens.client.client(), { hash }).catch((error: unknown) =>
                  error instanceof TransactionReceiptNotFoundError
                    ? undefined
                    : Promise.reject(error),
                ),
              ),
            ),
          ],
          { concurrency: "unbounded" },
        );
        const block =
          receipt === undefined
            ? undefined
            : yield* runEns(
                Rpc.fromPromise(() =>
                  getBlock(ens.client.client(), { blockNumber: receipt.blockNumber }),
                ),
              );
        const timestamp = block?.timestamp;
        return { step, hash, transaction, receipt, timestamp };
      }),
      { concurrency: "unbounded" },
    );

    const [now, commitment] = yield* Effect.all(
      [
        runEns(Rpc.blockTimestamp(ens.client, {})),
        Option.match(commitmentOf(plan), {
          onNone: () => Effect.succeedNone,
          onSome: (hash) =>
            Effect.asSome(
              runEns(Actions.registration.getCommitmentStatus(ens.client, { commitment: hash })),
            ),
        }),
      ],
      { concurrency: "unbounded" },
    );

    const states = stepStates(
      Arr.map(plan.steps, (step, index) => ({
        waitSeconds: step.waitFor?.seconds,
        receipts: Arr.filterMap(observed, ({ step: number, receipt, timestamp }) =>
          number === index + 1
            ? Result.succeed(
                receipt === undefined || timestamp === undefined
                  ? undefined
                  : { status: receipt.status, timestamp },
              )
            : Result.failVoid,
        ),
      })),
      now,
    );

    // The first unconfirmed step is re-checked when it could be signed now, or to explain a revert.
    const nextIndex = Arr.findFirstIndex(states, ({ state }) => state !== "confirmed");
    const recheck = Option.flatMap(nextIndex, (index) =>
      states[index]?.state === "ready" || states[index]?.state === "reverted"
        ? Arr.get(plan.steps, index)
        : Option.none(),
    );
    const issues = Option.isSome(recheck)
      ? simulationIssues(plan, [yield* simulateStep(ens.client, recheck.value, plan.account)])
      : [];

    const committed = Option.getOrUndefined(commitment);
    const lastConfirmed = Arr.last(states).pipe(
      Option.exists(({ state }) => state === "confirmed"),
    );

    return {
      operation: plan.operation,
      account: plan.account ?? null,
      steps: Arr.map(plan.steps, (step, index) => {
        const state = states[index] ?? { state: "blocked" as const };
        return {
          step: index + 1,
          description: step.description,
          state: state.state,
          transactions: Arr.filterMap(observed, ({ step: number, hash }) =>
            number === index + 1 ? Result.succeed(hash) : Result.failVoid,
          ),
          ...(state.state === "confirmed"
            ? { confirmedAt: fromUnixSeconds(state.confirmedAt) }
            : {}),
          ...(state.state === "waiting" ? { readyAt: fromUnixSeconds(state.readyAt) } : {}),
        };
      }),
      ...(committed === undefined
        ? {}
        : {
            commitment: {
              status: committed.status,
              ...(committed.readyAt === null
                ? {}
                : { readyAt: fromUnixSeconds(committed.readyAt) }),
              ...(committed.expiresAt === null
                ? {}
                : { expiresAt: fromUnixSeconds(committed.expiresAt) }),
            },
          }),
      issues,
      warnings: [
        ...Arr.map(
          unknown,
          ({ step, hash }) =>
            `Transaction ${hash} names step ${step}, but the plan has ${plan.steps.length} ` +
            `step${plan.steps.length === 1 ? "" : "s"}; it was ignored.`,
        ),
        ...Arr.filterMap(observed, ({ step, hash, transaction }) => {
          if (transaction === undefined)
            return Result.succeed(
              `Transaction ${hash} was not found on ${ens.chain}; check the hash and the network.`,
            );
          const calls = plan.steps[step - 1]?.calls ?? [];
          const matches = Arr.some(
            calls,
            (call) =>
              transaction.to !== null &&
              isAddressEqual(transaction.to, call.to) &&
              transaction.input === call.data &&
              transaction.value === call.value,
          );
          return matches
            ? Result.failVoid
            : Result.succeed(
                `Transaction ${hash} is not one of step ${step}'s calls (expected when a smart ` +
                  "wallet batches them); its state is still followed.",
              );
        }),
      ],
      next: nextAction({
        states: Arr.map(states, (state, index) => ({
          ...state,
          calls: plan.steps[index]?.calls.length ?? 0,
        })),
        now,
        issue: Option.getOrUndefined(
          Option.map(Arr.head(issues), (issue) =>
            issue.hint === undefined ? issue.message : `${issue.message} ${issue.hint}`,
          ),
        ),
        commitmentExpired: committed?.status === "expired" && !lastConfirmed,
        deadline:
          committed === undefined || committed.expiresAt === null || committed.status === "expired"
            ? undefined
            : fromUnixSeconds(committed.expiresAt),
        verifyWith: verifyTool(plan.operation),
      }),
      done: lastConfirmed,
    };
  });
