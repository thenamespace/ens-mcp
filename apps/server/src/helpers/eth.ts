import { formatUnits } from "viem";

export const humanizeWeiUnits = (amount: bigint) => ({
  eth: formatUnits(amount, 18),
  gwei: formatUnits(amount, 9),
  wei: amount.toString(),
});
