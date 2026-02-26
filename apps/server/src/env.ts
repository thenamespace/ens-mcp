import { DatabaseConfig, type DatabaseEnvValues } from "@repo/database";
import { OtelConfig, type OtelConfigEnvValues } from "@repo/telemetry";
import { Config, ConfigProvider, Context, Layer } from "effect";

type EnvValues = DatabaseEnvValues & OtelConfigEnvValues;

const envConfig: Config.Config<EnvValues> = DatabaseConfig.pipe(
  Config.zipWith(OtelConfig, (a, b) => ({ ...a, ...b })),
);

export class Env extends Context.Tag("Auth")<Env, EnvValues>() {}

export const EnvLive = Layer.merge(
  Layer.setConfigProvider(ConfigProvider.fromEnv()),
  Layer.effect(Env, envConfig),
);
