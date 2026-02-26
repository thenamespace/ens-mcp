import { Config } from "effect";
export const EnsClientConfig = Config.all({
  rpcUrl: Config.redacted("RPC_URL").pipe(Config.option),
});

export type EnsClientConfigValues = Config.Config.Success<
  typeof EnsClientConfig
>;
