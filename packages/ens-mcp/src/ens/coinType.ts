import { CoinType } from "@ensforge/sdk/effect";

import { tryEns } from "./errors.js";

/** The coin type of a `Coin` parameter; fails for an unknown symbol. */
export const toCoinType = (coin: string) => tryEns(() => CoinType.from(toCoinInput(coin)));

/** A `Coin` parameter as ensforge's coin input: digits become a coin type, symbols stay as they are. */
export const toCoinInput = (coin: string): string | bigint =>
  /^\d+$/.test(coin) ? BigInt(coin) : coin;
