import { Effect, Result, String as Str } from "effect";
import { Base64Url } from "effect/encoding";

import { Errors, Plan } from "@ensforge/sdk/effect";
import { deflateSync, inflateSync, strFromU8, strToU8 } from "fflate";

import { viemChains, type Chain } from "./Chain.js";
import { toToolError, type EnsToolError } from "./errors.js";

const prefix = "ensplan1.";

// Well above any real plan, and small enough that a handle crafted to inflate without end cannot
// exhaust memory: decoding stops here and reads the plan as invalid.
const maxPlanBytes = 1_048_576;

/**
 * A plan as a self-contained string for the model to hand back later: the serialized plan,
 * compressed and base64url-encoded. The server keeps nothing, so any instance can read it.
 */
export const encodePlan = (plan: Plan): string =>
  `${prefix}${Base64Url.encode(deflateSync(strToU8(Plan.serialize(plan)), { level: 9 }))}`;

/** The plan in a handle from `encodePlan`; fails with `PLAN_INVALID` for anything else. */
export const decodePlan = (handle: string): Effect.Effect<Plan, EnsToolError> => {
  const invalid = Effect.fail(
    toToolError(
      new Errors.PlanError({
        code: "PLAN_INVALID",
        shortMessage: "This plan handle is not valid.",
      }),
    ),
  );
  if (!Str.startsWith(prefix)(handle)) return invalid;

  const bytes = Base64Url.decode(Str.slice(prefix.length)(handle));
  if (Result.isFailure(bytes)) return invalid;
  return Effect.try({
    try: () => {
      // With `out`, fflate stops writing when the buffer is full instead of growing it.
      const json = inflateSync(bytes.success, { out: new Uint8Array(maxPlanBytes) });
      if (json.length === maxPlanBytes) throw new Error("Plan too large");
      return Plan.deserialize(strFromU8(json));
    },
    catch: () => undefined,
  }).pipe(Effect.catch(() => invalid));
};

/** Fails with `PLAN_CHAIN_MISMATCH` unless `plan` is for `chain`, the chain the server reads. */
export const requirePlanChain = (plan: Plan, chain: Chain): Effect.Effect<void, EnsToolError> =>
  plan.chainId === viemChains[chain].id
    ? Effect.void
    : Effect.fail(
        toToolError(
          new Errors.PlanError({
            code: "PLAN_CHAIN_MISMATCH",
            shortMessage: `This plan is for chain ${plan.chainId}, but this server reads ${chain}.`,
          }),
        ),
      );
