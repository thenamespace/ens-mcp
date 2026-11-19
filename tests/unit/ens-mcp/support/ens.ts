import { Layer } from "effect";

import { Ensforge } from "@ensforge/sdk/effect";
import { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";
import { createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";

/** ENS on an RPC that rejects every request, for tests that must fail before the network. */
export const OfflineEns = Layer.succeed(
  Ens,
  Ens.of({
    chain: "mainnet",
    client: Ensforge.create({
      publicClient: createPublicClient({
        chain: mainnet,
        transport: custom({
          request: ({ method }) => Promise.reject(new Error(`Unexpected RPC request: ${method}`)),
        }),
      }),
    }),
    hasIndexer: false,
  }),
);
