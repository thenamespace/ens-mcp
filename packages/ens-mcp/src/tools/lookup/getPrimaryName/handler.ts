import { Effect, Result } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { toCoinType } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import type { GetPrimaryName } from "./tool.js";

/** Handles `get_primary_name`. */
export const getPrimaryName = (ens: Ens["Service"]) =>
  Effect.fn("get_primary_name")(function* (
    params: typeof GetPrimaryName.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPrimaryName.successSchema.Type, EnsToolError> {
    const coin = params.coin ?? "eth";
    const coinType = yield* toCoinType(coin);

    const results = yield* Effect.forEach(
      params.addresses,
      (address) =>
        runEns(Actions.primaryName.get(ens.client, { address, coin: coinType })).pipe(
          Effect.result,
          Effect.map((result) =>
            Result.isSuccess(result)
              ? { address, name: result.success }
              : { address, error: result.failure },
          ),
        ),
      { concurrency: "unbounded" },
    );

    return { coin, results };
  });
