import { Effect, Result } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { toCoinType } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, toItemError, type EnsToolError } from "../../../ens/errors.js";
import type { ResolveName } from "./tool.js";

/** Handles `resolve_name`. */
export const resolveName = (ens: Ens["Service"]) =>
  Effect.fn("resolve_name")(function* (
    params: typeof ResolveName.parametersSchema.Type,
  ): Effect.fn.Return<typeof ResolveName.successSchema.Type, EnsToolError> {
    const coin = params.coin ?? "eth";
    const coinType = yield* toCoinType(coin);

    // Concurrent reads share one multicall (ensforge batches them); a bad name fails only its item.
    const results = yield* Effect.forEach(
      params.names,
      (name) =>
        runEns(Actions.record.getAddress(ens.client, { name, coin: coinType })).pipe(
          Effect.result,
          Effect.map((result) =>
            Result.isSuccess(result)
              ? { name, address: result.success }
              : { name, error: toItemError(result.failure) },
          ),
        ),
      { concurrency: "unbounded" },
    );

    return { coin, results };
  });
