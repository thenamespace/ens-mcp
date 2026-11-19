import { Cause, Effect, Schedule, Schema } from "effect";

import { Errors } from "@ensforge/sdk/effect";

import { hints } from "./hints.js";

/**
 * Why an ENS operation failed, written for the model: ensforge's stable `code`, what went wrong,
 * and what to do next.
 */
export class EnsToolError extends Schema.TaggedError<
  EnsToolError,
  { readonly brand: unique symbol }
>()("EnsToolError", {
  code: Schema.String,
  message: Schema.String,
  hint: Schema.optionalKey(Schema.String),
  retryable: Schema.Boolean,
  docsUrl: Schema.String,
}) {}

/**
 * Why one item of a batch failed: the error without the fields that only matter for a whole call.
 */
export const ItemError = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
  hint: Schema.optionalKey(Schema.String),
});

/** The `ItemError` of a failed item. */
export const toItemError = (error: EnsToolError): typeof ItemError.Type => ({
  code: error.code,
  message: error.message,
  ...(error.hint === undefined ? {} : { hint: error.hint }),
});

/** Converts an ensforge error, keeping its precise message and its user-facing next step. */
export const toToolError = (error: Errors.AnyError): EnsToolError => {
  const { action } = Errors.describe(error, { messages: hints });
  return EnsToolError.make({
    code: error.code,
    message: error.shortMessage,
    ...(action === undefined ? {} : { hint: action }),
    retryable: error.retryable,
    docsUrl: error.docsUrl,
  });
};

/**
 * Runs a synchronous ensforge utility, such as `CoinType.from`, that throws ensforge errors for
 * invalid input. Anything else it throws is a defect.
 */
export const tryEns = <A>(evaluate: () => A): Effect.Effect<A, EnsToolError> =>
  Effect.try({
    try: evaluate,
    catch: (error) => (Errors.is(error) ? toToolError(error) : new Cause.UnknownError(error)),
  }).pipe(Effect.catchTag("UnknownError", Effect.die));

/**
 * Runs an ensforge action for a tool: retries failures ensforge marks retryable (RPC and gateway
 * hiccups), then reports any failure as an `EnsToolError`.
 */
export const runEns = <A, R>(
  action: Effect.Effect<A, Errors.AnyError, R>,
): Effect.Effect<A, EnsToolError, R> =>
  action.pipe(
    Effect.retry({
      times: 2,
      schedule: Schedule.exponential("200 millis"),
      while: (error) => error.retryable,
    }),
    Effect.mapError(toToolError),
  );
