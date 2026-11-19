import { Effect, Result } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, toItemError, type EnsToolError } from "../../../ens/errors.js";
import { toAmount } from "../../../schemas/Amount.js";
import { describeSeconds, toSeconds } from "../../../schemas/Duration.js";
import type { CheckAvailability } from "./tool.js";

/** Handles `check_availability`. */
export const checkAvailability = (ens: Ens["Service"]) =>
  Effect.fn("check_availability")(function* (
    params: typeof CheckAvailability.parametersSchema.Type,
  ): Effect.fn.Return<typeof CheckAvailability.successSchema.Type, EnsToolError> {
    const duration = toSeconds(params.duration ?? "1 year");

    const check = Effect.fnUntraced(function* (name: string) {
      const available = yield* runEns(Actions.registration.isAvailable(ens.client, { name }));
      if (!available) return { name, available };

      const price = yield* runEns(
        Actions.registration.getPrice(ens.client, {
          name,
          duration,
          ...(params.paymentToken === undefined ? {} : { paymentToken: params.paymentToken }),
        }),
      );
      return {
        name,
        available,
        price: toAmount(price.total, price.token),
        ...(price.premium === 0n ? {} : { premium: toAmount(price.premium, price.token) }),
      };
    });

    const results = yield* Effect.forEach(
      params.names,
      (name) =>
        check(name).pipe(
          Effect.result,
          Effect.map((result) =>
            Result.isSuccess(result)
              ? result.success
              : { name, error: toItemError(result.failure) },
          ),
        ),
      { concurrency: "unbounded" },
    );

    return { duration: describeSeconds(duration), results };
  });
