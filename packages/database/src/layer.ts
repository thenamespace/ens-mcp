import { PgClient } from "@effect/sql-pg";
import { relations } from "@repo/schema";
import * as pgDrizzle from "drizzle-orm/effect-postgres";
import { Config, Context, Effect, Layer } from "effect";
import { types } from "pg";

import { databaseConfig } from "./config";

const PgLive = PgClient.layerConfig({
  ...databaseConfig,
  types: {
    getTypeParser: Config.succeed((typeId, format) => {
      if (
        [1184, 1114, 1082, 1186, 1231, 1115, 1185, 1187, 1182].includes(typeId)
      ) {
        // biome-ignore lint/suspicious/noExplicitAny: safe
        return (val: any) => val;
      }
      return types.getTypeParser(typeId, format);
    }),
  },
});

export const makeDatabase = pgDrizzle
  .make({ relations })
  .pipe(Effect.provide(pgDrizzle.DefaultServices));

export type DatabaseType = Effect.Effect.Success<typeof makeDatabase>;

export class Database extends Context.Tag("Database")<
  Database,
  DatabaseType
>() {}

const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    return yield* makeDatabase;
  }),
);
export const DatabaseLive = Layer.provideMerge(DatabaseLayer, PgLive);
