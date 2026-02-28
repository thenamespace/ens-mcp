import {
  addEnsContracts,
  ensPublicActions,
  ensSubgraphActions,
} from "@ensdomains/ensjs";
import { Effect, Layer, Option, Redacted, ServiceMap } from "effect";
import { createClient, http } from "viem";
import { mainnet } from "viem/chains";

import { EnsClientConfig } from "@/config";

const makeEnsClient = Effect.gen(function* () {
  const config = yield* EnsClientConfig;

  const url = Option.isSome(config.rpcUrl)
    ? Redacted.value(config.rpcUrl.value)
    : undefined;

  const subgraphUrl = Option.isSome(config.subgraphUrl)
    ? Redacted.value(config.subgraphUrl.value)
    : "https://api.alpha.ensnode.io/subgraph";

  const chain = {
    ...addEnsContracts(mainnet),
    subgraphs: {
      ens: {
        url: subgraphUrl,
      },
    },
  };

  const client = createClient({
    chain,
    transport: http(url),
  })
    .extend(ensSubgraphActions)
    .extend(ensPublicActions);

  return client;
});

export type EnsClient = Effect.Success<typeof makeEnsClient>;

export const EnsClient = ServiceMap.Service<EnsClient>("EnsClient");

export const EnsClientLive = Layer.effect(EnsClient, makeEnsClient);
