import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { toAmount } from "../../../schemas/Amount.js";
import { describeSeconds, toSeconds } from "../../../schemas/Duration.js";
import type { GetPrice } from "./tool.js";

/** Handles `get_price`. */
export const getPrice = (ens: Ens["Service"]) =>
  Effect.fn("get_price")(function* (
    params: typeof GetPrice.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPrice.successSchema.Type, EnsToolError> {
    const duration = toSeconds(params.duration);
    const paymentToken =
      params.paymentToken === undefined ? {} : { paymentToken: params.paymentToken };

    if (params.kind === "renewal") {
      const renewal = yield* runEns(
        Actions.registration.getRenewalPrice(ens.client, {
          names: params.names,
          duration,
          ...paymentToken,
        }),
      );
      return {
        kind: "renewal",
        duration: describeSeconds(duration),
        total: toAmount(renewal.total, renewal.token),
        items: Arr.map(renewal.items, (item) => ({
          name: item.name,
          price: toAmount(item.amount, renewal.token),
        })),
      };
    }

    const prices = yield* Effect.forEach(
      params.names,
      (name) =>
        Effect.map(
          runEns(Actions.registration.getPrice(ens.client, { name, duration, ...paymentToken })),
          (price) => ({ name, price }),
        ),
      { concurrency: "unbounded" },
    );
    // The parameters schema requires at least one name; every price is in the same token.
    if (!Arr.isReadonlyArrayNonEmpty(prices)) return yield* Effect.die("get_price: no names");
    const { token } = prices[0].price;
    return {
      kind: "registration",
      duration: describeSeconds(duration),
      total: toAmount(
        Arr.reduce(prices, 0n, (total, { price }) => total + price.total),
        token,
      ),
      items: Arr.map(prices, ({ name, price }) => ({
        name,
        price: toAmount(price.total, price.token),
        ...(price.premium === 0n ? {} : { premium: toAmount(price.premium, price.token) }),
      })),
    };
  });
