import { createEnsPublicClient } from "@ensdomains/ensjs";
import { Context, Effect, Layer, Option, Redacted } from "effect";
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

export type EnsClientType = Effect.Effect.Success<typeof makeEnsClient>;

export class EnsClient extends Context.Tag("CEnsClientg")<
  EnsClient,
  EnsClientType
>() {}

export const EnsClientLive = Layer.effect(EnsClient, makeEnsClient);
