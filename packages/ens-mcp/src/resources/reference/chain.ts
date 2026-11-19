import { Array as Arr, Effect, Layer, Record as Rec, Schema } from "effect";
import { McpServer } from "effect/ai";

import { Chain, viemChains } from "../../ens/Chain.js";
import { Ens } from "../../ens/Ens.js";

const Deployment = Schema.Struct({
  status: Schema.String,
  contracts: Schema.Record(Schema.String, Schema.String),
});

const ChainInfo = Schema.Struct({
  chain: Chain,
  chainId: Schema.Int,
  ensv1: Schema.optionalKey(Deployment),
  ensv2: Schema.optionalKey(Deployment),
  indexer: Schema.NullOr(Schema.String),
  rpc: Schema.Literals(["configured", "public"]),
});

/** A deployment's status and contract addresses, leaving out contracts it does not have. */
const toDeployment = (deployment: { readonly status: string; readonly contracts: object }) => ({
  status: deployment.status,
  contracts: Rec.fromEntries(
    Arr.filter(
      // ensforge's contract maps are interfaces, which Record.toEntries does not accept.
      // oxlint-disable-next-line effecttsgo/prefer-effect-record
      Object.entries(deployment.contracts),
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  ),
});

/** What the server reads: its chain, the ENS contracts there, its indexer and the kind of RPC. */
export const ChainResource = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;
    const { v1, v2 } = ens.client.deployment;
    const info = yield* Schema.encodeEffect(Schema.fromJsonString(ChainInfo))({
      chain: ens.chain,
      chainId: viemChains[ens.chain].id,
      ...(v1 === undefined ? {} : { ensv1: toDeployment(v1) }),
      ...(v2 === undefined ? {} : { ensv2: toDeployment(v2) }),
      indexer: !ens.hasIndexer
        ? null
        : ens.chain === "mainnet"
          ? "bigname, with goldsky as fallback"
          : "bigname",
      rpc: ens.customRpc ? "configured" : "public",
    }).pipe(Effect.orDie);

    return McpServer.resource({
      uri: "ens://chain",
      name: "ENS chain",
      description:
        "The chain this server reads, its ENSv1 and ENSv2 contract addresses, the indexer and " +
        "whether a configured RPC is used",
      mimeType: "application/json",
      content: Effect.succeed(info),
    });
  }),
);
