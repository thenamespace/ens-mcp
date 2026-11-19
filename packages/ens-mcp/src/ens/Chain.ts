import { Schema } from "effect";

import type { Chain as ViemChain } from "viem";
import { mainnet, sepolia } from "viem/chains";

/** A chain ENS lives on. The server reads one, chosen at startup. */
export const Chain = Schema.Literals(["mainnet", "sepolia"]);
export type Chain = typeof Chain.Type;

/** viem's definition of each chain. */
export const viemChains: Readonly<Record<Chain, ViemChain>> = { mainnet, sepolia };
