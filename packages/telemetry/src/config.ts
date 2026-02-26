import { Config } from "effect";

export const OtelConfig = Config.all({
  baseUrl: Config.string("OTEL_BASE_URL"),
  dataset: Config.string("OTEL_DATASET").pipe(Config.option),
  token: Config.redacted("OTEL_API_TOKEN").pipe(Config.option),
});

export type OtelConfigEnvValues = Config.Config.Success<typeof OtelConfig>;
