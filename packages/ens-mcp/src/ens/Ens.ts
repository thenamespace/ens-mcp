import { Cause, Context, Duration, Effect, Layer, Option, Redacted } from "effect";

import { Ensforge } from "@ensforge/sdk/effect";
import { bigname, fallback, goldsky } from "@ensforge/sdk/indexer";
import { createPublicClient, http, type Transport } from "viem";

import { StartupError } from "../StartupError.js";
import { viemChains, type Chain } from "./Chain.js";

/** How the server reaches ENS. */
export type EnsOptions = {
  readonly chain: Chain;
  /** RPC URL for the chain; viem's public RPC when absent. */
  readonly rpcUrl: Option.Option<Redacted.Redacted>;
  /** Refuse to start without `rpcUrl`, instead of using a public RPC. */
  readonly requireRpc: boolean;
  readonly indexer: "bigname" | "none";
};

/** The ensforge client for the server's chain, built at startup and shared by every request. */
export class Ens extends Context.Service<
  Ens,
  {
    readonly chain: Chain;
    readonly client: Ensforge.Client;
    readonly hasIndexer: boolean;
    /** Whether reads go through a configured RPC rather than a public one. */
    readonly customRpc: boolean;
  }
>()("@thenamespace/ens-mcp/Ens") {
  static readonly layer = (options: EnsOptions) =>
    Layer.effect(
      Ens,
      Effect.gen(function* () {
        const chain = viemChains[options.chain];
        const transport = yield* rpcTransport(options);
        const client = Ensforge.create({
          chain,
          ...(transport === undefined ? {} : { transports: { [chain.id]: transport } }),
          ...(options.indexer === "none" ? {} : { indexer: indexer(options.chain) }),
        });

        return Ens.of({
          chain: options.chain,
          client,
          hasIndexer: options.indexer !== "none",
          customRpc: Option.isSome(options.rpcUrl),
        });
      }),
    );
}

/**
 * bigname, and on mainnet goldsky behind it: goldsky answers when bigname cannot, including every
 * Basenames query, which bigname does not index.
 */
const indexer = (chain: Chain) =>
  chain === "mainnet" ? fallback([bigname(), goldsky()]) : bigname();

/**
 * The configured RPC, checked to serve the configured chain, or `undefined` with a warning for
 * viem's public RPC. L2 namespaces are always read through their chains' public RPCs.
 */
const rpcTransport = Effect.fnUntraced(function* (
  options: EnsOptions,
): Effect.fn.Return<Transport | undefined, StartupError> {
  const chain = viemChains[options.chain];
  if (Option.isNone(options.rpcUrl)) {
    if (options.requireRpc)
      return yield* StartupError.make({
        message: "No RPC URL: set ENS_MCP_RPC_URL (required by ENS_MCP_REQUIRE_RPC).",
      });
    yield* Effect.logWarning(
      `Using a public RPC for ${options.chain}; set ENS_MCP_RPC_URL for reliable access.`,
    );
    return undefined;
  }

  const transport = http(Redacted.value(options.rpcUrl.value));
  const client = createPublicClient({ chain, transport });
  // A wrong-chain RPC would answer every lookup from the wrong ENS; an unreachable one may recover,
  // so only a mismatch stops the server.
  const chainId = yield* Effect.tryPromise({
    try: () => client.getChainId(),
    catch: (cause) => new Cause.UnknownError(cause),
  }).pipe(Effect.timeout(Duration.seconds(5)), Effect.option);
  if (Option.isNone(chainId))
    yield* Effect.logWarning("Could not reach ENS_MCP_RPC_URL at startup.");
  else if (chainId.value !== chain.id)
    return yield* StartupError.make({
      message: `ENS_MCP_RPC_URL serves chain ${chainId.value}, not ${options.chain} (${chain.id}).`,
    });
  return transport;
});
