import { Config } from "effect";

export const databaseConfig = {
  database: Config.string("POSTGRES_DATABASE"),
  host: Config.string("POSTGRES_HOST"),
  password: Config.redacted("POSTGRES_PASSWORD"),
  port: Config.number("POSTGRES_PORT"),
  username: Config.string("POSTGRES_USERNAME"),
};

export const DatabaseConfig = Config.all(databaseConfig);

export type DatabaseEnvValues = Config.Config.Success<typeof DatabaseConfig>;
