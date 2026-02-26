import { Config, type Option, type Redacted } from "effect";
export const EnsClientConfig = Config.all({
  rpcUrl: Config.redacted("RPC_URL").pipe(Config.option),
});

export type EnsClientConfigValues = {
  rpcUrl: Option.Option<Redacted.Redacted<string>>;
};
