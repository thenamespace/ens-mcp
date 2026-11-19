import { Layer } from "effect";

import { Ensforge } from "@ensforge/sdk/effect";
import { Chains } from "@thenamespace/ens-mcp/internal/ens/Chains";
import { createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";

const offline = Ensforge.create({
  publicClient: createPublicClient({
    chain: mainnet,
    transport: custom({
      request: ({ method }) => Promise.reject(new Error(`Unexpected RPC request: ${method}`)),
    }),
  }),
});

/** Chains whose RPC rejects every request, for tests that must fail before reaching the network. */
export const OfflineChains = Layer.succeed(
  Chains,
  Chains.of({ defaultChain: "mainnet", client: () => offline, hasIndexer: false }),
);
