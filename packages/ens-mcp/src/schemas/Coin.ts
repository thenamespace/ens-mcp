import { Schema } from "effect";

/**
 * A coin or chain whose address an ENS name can hold (ENSIP-9, ENSIP-11): a symbol such as `btc`
 * or `base`, or a numeric coin type.
 */
export const Coin = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(256)).annotate({
  description: "Coin symbol such as eth, btc, sol, base or op, or a numeric coin type (ENSIP-9/11)",
  examples: ["eth", "btc", "2147492101"],
});
