import { Cause, Context, Duration, Effect, Layer, Option, Redacted } from "effect";

import { Ensforge } from "@ensforge/sdk/effect";
import { bigname } from "@ensforge/sdk/indexer";
import { createPublicClient, http, type PublicClient } from "viem";

import { StartupError } from "../StartupError.js";
import { rpcUrlEnv, viemChains, type Chain } from "./Chain.js";

/** How the server reaches each chain. */
export type ChainsOptions = {
  readonly defaultChain: Chain;
  /** RPC URL per chain; a chain without one uses viem's public RPC. */
  readonly rpcUrls: Readonly<Record<Chain, Option.Option<Redacted.Redacted>>>;
  /** Refuse to start when a chain has no RPC URL, instead of using a public RPC. */
  readonly requireRpc: boolean;
  readonly indexer: "bigname" | "none";
};

/** One ensforge client per chain, built at startup and shared by every request. */
export class Chains extends Context.Service<
  Chains,
  {
    readonly defaultChain: Chain;
    /** The client for `chain`, or for the default chain. */
    readonly client: (chain?: Chain) => Ensforge.Client;
    readonly hasIndexer: boolean;
  }
>()("@thenamespace/ens-mcp/Chains") {
  static readonly layer = (options: ChainsOptions) =>
    Layer.effect(
      Chains,
      Effect.gen(function* () {
        const ensforge = (chain: Chain) =>
          Effect.map(publicClient(chain, options), (client) =>
            Ensforge.create({
              publicClient: client,
              ...(options.indexer === "bigname" ? { indexer: bigname() } : {}),
            }),
          );
        const clients = yield* Effect.all(
          { mainnet: ensforge("mainnet"), sepolia: ensforge("sepolia") },
          { concurrency: "unbounded" },
        );

        return Chains.of({
          defaultChain: options.defaultChain,
          client: (chain = options.defaultChain) => clients[chain],
          hasIndexer: options.indexer !== "none",
        });
      }),
    );
}

/**
 * A viem client for `chain` on its configured RPC, checked to serve that chain, or on viem's
 * public RPC with a warning.
 */
const publicClient = Effect.fnUntraced(function* (
  chain: Chain,
  options: ChainsOptions,
): Effect.fn.Return<PublicClient, StartupError> {
  const url = options.rpcUrls[chain];
  if (Option.isNone(url)) {
    if (options.requireRpc)
      return yield* StartupError.make({
        message: `No RPC URL for ${chain}: set ${rpcUrlEnv(chain)} (required by ENS_MCP_REQUIRE_RPC).`,
      });
    if (chain === options.defaultChain)
      yield* Effect.logWarning(
        `Using a public RPC for ${chain}; set ${rpcUrlEnv(chain)} for reliable access.`,
      );
    return createPublicClient({ chain: viemChains[chain], transport: http() });
  }

  const client = createPublicClient({
    chain: viemChains[chain],
    transport: http(Redacted.value(url.value)),
  });
  // A wrong-chain RPC would answer every lookup from the wrong ENS; an unreachable one may recover,
  // so only a mismatch stops the server.
  const chainId = yield* Effect.tryPromise({
    try: () => client.getChainId(),
    catch: (cause) => new Cause.UnknownError(cause),
  }).pipe(Effect.timeout(Duration.seconds(5)), Effect.option);
  if (Option.isNone(chainId))
    yield* Effect.logWarning(`Could not reach the ${chain} RPC (${rpcUrlEnv(chain)}) at startup.`);
  else if (chainId.value !== viemChains[chain].id)
    return yield* StartupError.make({
      message: `${rpcUrlEnv(chain)} serves chain ${chainId.value}, not ${chain} (${viemChains[chain].id}).`,
    });
  return client;
});
