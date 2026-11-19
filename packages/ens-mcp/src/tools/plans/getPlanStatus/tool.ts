import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address } from "../../../schemas/Address.js";
import { Hex } from "../../../schemas/Hex.js";
import { PlanHandle, PlanIssue } from "../../../schemas/PreparedWrite.js";
import { Timestamp } from "../../../schemas/Timestamp.js";
import { ReadsEns } from "../../annotations.js";

const TransactionHash = Hex.check(Schema.isPattern(/^0x[0-9a-fA-F]{64}$/)).annotate({
  description: "Transaction hash, 32 bytes as hex",
});

/** Follows a prepared plan after the user starts signing it. */
export const GetPlanStatus = Tool.make("get_plan_status", {
  description:
    "Follow a prepared plan after the user signs it, e.g. 'I sent the commit, what now?'. Give " +
    "the plan handle and the hashes of the transactions sent so far, each with its step (none " +
    "before signing). Returns each step's state (confirmed, pending, reverted, waiting, ready or " +
    "blocked), the registration commitment's window, whether the next step would succeed now " +
    "and what to do next. Once every step is confirmed it names the tool that shows the result.",
  parameters: Schema.Struct({
    plan: PlanHandle,
    transactions: Schema.optionalKey(
      Schema.Array(
        Schema.Struct({
          step: Schema.Int.check(Schema.isGreaterThanOrEqualTo(1)),
          hash: TransactionHash,
        }),
      ).check(Schema.isMaxLength(20)),
    ).annotate({ description: "Transactions the user sent, each with the step it signs" }),
  }),
  success: Schema.Struct({
    operation: Schema.String,
    account: Schema.NullOr(Address),
    steps: Schema.Array(
      Schema.Struct({
        step: Schema.Int,
        description: Schema.String,
        state: Schema.Literals(["confirmed", "pending", "reverted", "waiting", "ready", "blocked"]),
        transactions: Schema.Array(TransactionHash),
        confirmedAt: Schema.optionalKey(Timestamp),
        readyAt: Schema.optionalKey(Timestamp),
      }),
    ),
    commitment: Schema.optionalKey(
      Schema.Struct({
        status: Schema.Literals(["pending", "ready", "expired", "unknown"]),
        readyAt: Schema.optionalKey(Timestamp),
        expiresAt: Schema.optionalKey(Timestamp),
      }),
    ).annotate({ description: "Registration only: when the register step may be sent" }),
    issues: Schema.Array(PlanIssue).annotate({
      description: "Why the next step would fail if signed now, or why a step reverted",
    }),
    warnings: Schema.Array(Schema.String),
    next: Schema.String.annotate({ description: "What the user should do next" }),
    done: Schema.Boolean,
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Follow a plan")
  .annotateMerge(ReadsEns);
