import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Coin } from "../../../schemas/Coin.js";
import { Computes } from "../../annotations.js";

/** Converts between coin symbols, coin types and EVM chain IDs. */
export const ConvertCoinType = Tool.make("convert_coin_type", {
  description:
    "Convert between a coin symbol, its ENS coin type (ENSIP-9, ENSIP-11) and an EVM chain ID, " +
    "e.g. 'What coin type does Base use?' (base, 2147492101, chain 8453). Give either coin or " +
    "chainId. Works offline.",
  parameters: Schema.Struct({
    coin: Schema.optionalKey(Coin),
    chainId: Schema.optionalKey(Schema.Int.check(Schema.isGreaterThan(0))).annotate({
      description: "EVM chain ID, e.g. 8453 for Base",
    }),
  }).check(
    Schema.makeFilter(
      ({ coin, chainId }) =>
        (coin === undefined) !== (chainId === undefined) || "Give exactly one of coin or chainId",
    ),
  ),
  success: Schema.Struct({
    coinType: Schema.String.annotate({ description: "Coin type as a decimal string" }),
    symbol: Schema.NullOr(Schema.String),
    chainId: Schema.NullOr(Schema.Int).annotate({
      description: "EVM chain ID; null for non-EVM coins",
    }),
    evm: Schema.Boolean.annotate({ description: "Whether addresses are EVM (0x…) addresses" }),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Convert coin types")
  .annotateMerge(Computes);
