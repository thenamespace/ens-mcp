import { Schema } from "effect";

import { formatUnits } from "viem";

/** A token or ETH amount: readable, in its unit, and exact in the smallest unit. */
export const Amount = Schema.Struct({
  value: Schema.String.annotate({ description: "Amount in whole units, e.g. 8.000021" }),
  unit: Schema.String.annotate({ description: "ETH, USDC, DAI…" }),
  raw: Schema.String.annotate({ description: "Exact amount in the smallest unit" }),
});

/** An `Amount` of `raw` smallest units of a token with `decimals`. */
export const toAmount = (
  raw: bigint,
  token: { readonly symbol: string; readonly decimals: number },
) => ({
  value: formatUnits(raw, token.decimals),
  unit: token.symbol,
  raw: raw.toString(),
});

/** A readable amount, e.g. `8.000021 USDC`. */
export const describeAmount = (amount: typeof Amount.Type) => `${amount.value} ${amount.unit}`;

/** The tokens registrations and renewals can be paid with. */
export const PaymentToken = Schema.Literals(["usdc", "dai"]).annotate({
  description: "Token to pay with: usdc (default) or dai",
});
