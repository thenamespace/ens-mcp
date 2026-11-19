import { Schema, String as Str } from "effect";

import type { Chain as ViemChain } from "viem";
import { mainnet, sepolia } from "viem/chains";

/** A chain ENS lives on that the server can read. */
export const Chain = Schema.Literals(["mainnet", "sepolia"]).annotate({
  description: "Chain to read ENS from. Defaults to the server's chain, usually mainnet.",
});
export type Chain = typeof Chain.Type;

/** viem's definition of each chain. */
export const viemChains: Readonly<Record<Chain, ViemChain>> = { mainnet, sepolia };

/** Environment variable holding the RPC URL for `chain`, e.g. `ENS_MCP_MAINNET_RPC_URL`. */
export const rpcUrlEnv = (chain: Chain) => `ENS_MCP_${Str.toUpperCase(chain)}_RPC_URL`;
