import { createEnsPublicClient } from "@ensdomains/ensjs";
import { Effect, Layer, Option, Redacted, ServiceMap } from "effect";
import { http } from "viem";
import { mainnet } from "viem/chains";

import { EnsClientConfig } from "@/config";

const makeEnsClient = Effect.gen(function* () {
  const config = yield* EnsClientConfig;

  const url = Option.isSome(config.rpcUrl)
    ? Redacted.value(config.rpcUrl.value)
    : undefined;

  return createEnsPublicClient({
    chain: mainnet,
    transport: http(url),
  });
});

export type EnsClient = Effect.Success<typeof makeEnsClient>;
export const EnsClient = ServiceMap.Service<EnsClient>("EnsClient");

export const EnsClientLive = Layer.effect(EnsClient, makeEnsClient);
