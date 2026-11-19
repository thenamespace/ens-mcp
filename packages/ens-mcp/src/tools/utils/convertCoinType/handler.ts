import { Effect } from "effect";

import { CoinType } from "@ensforge/sdk/effect";

import { toCoinInput } from "../../../ens/coinType.js";
import { tryEns, type EnsToolError } from "../../../ens/errors.js";
import type { ConvertCoinType } from "./tool.js";

/** Handles `convert_coin_type`. */
export const convertCoinType = Effect.fn("convert_coin_type")(function* (
  params: typeof ConvertCoinType.parametersSchema.Type,
): Effect.fn.Return<typeof ConvertCoinType.successSchema.Type, EnsToolError> {
  const { coin, chainId } = params;
  // The parameters schema requires exactly one of the two.
  const input =
    coin !== undefined ? toCoinInput(coin) : chainId !== undefined ? { chainId } : undefined;
  if (input === undefined) return yield* Effect.die("convert_coin_type: no coin or chainId");
  const coinType = yield* tryEns(() => CoinType.from(input));

  return {
    coinType: coinType.toString(),
    symbol: CoinType.toSymbol(coinType),
    chainId: CoinType.toChainId(coinType),
    evm: CoinType.isEvm(coinType),
  };
});
