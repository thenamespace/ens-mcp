import { Layer } from "effect";

import { Ensforge } from "@ensforge/sdk/effect";
import type { Indexer } from "@ensforge/sdk/indexer";
import { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";
import { createPublicClient, custom } from "viem";
import { mainnet } from "viem/chains";

const offlineRpc = createPublicClient({
  chain: mainnet,
  transport: custom({
    request: ({ method }) => Promise.reject(new Error(`Unexpected RPC request: ${method}`)),
  }),
});

/** ENS on an RPC that rejects every request, with `indexer` when given. */
export const offlineEns = (options: { readonly indexer?: Indexer } = {}) =>
  Layer.succeed(
    Ens,
    Ens.of({
      chain: "mainnet",
      client: Ensforge.create({
        publicClient: offlineRpc,
        ...(options.indexer === undefined ? {} : { indexer: options.indexer }),
      }),
      hasIndexer: options.indexer !== undefined,
      customRpc: true,
    }),
  );

/** ENS without an indexer, for tests that must fail before reaching the network. */
export const OfflineEns = offlineEns();
