import { Config, type Effect } from "effect";
export const EnsClientConfig = Config.all({
  rpcUrl: Config.redacted("RPC_URL").pipe(Config.option),
  subgraphUrl: Config.redacted("SUBGRAPH_URL").pipe(Config.option),
});

export type EnsClientConfigValues = Effect.Success<
  ReturnType<typeof EnsClientConfig.asEffect>
>;
