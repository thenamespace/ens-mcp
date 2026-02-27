import { Duration, Effect, Layer, ServiceMap } from "effect";

import { humanizeWeiUnits, parseDuration } from "@/helpers";

import { EnsClient } from "./ens-client";
import { getEnsProfileInternal } from "./helpers";
import type {
  EnsProfile,
  FormattedNamePrice,
  GetEnsProfileParams,
} from "./schema";

export type EnsPublicActions = {
  isNameAvailable: (name: string) => Effect.Effect<boolean>;
  getPrice: (
    name: string,
    duration: string,
  ) => Effect.Effect<FormattedNamePrice>;
  getEnsProfile: (params: GetEnsProfileParams) => Effect.Effect<EnsProfile>;
};

export const EnsPublicActions =
  ServiceMap.Service<EnsPublicActions>("EnsPublicActions");

export const EnsPublicActionsLive = Layer.effect(
  EnsPublicActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    return {
      getEnsProfile: (params) =>
        Effect.gen(function* () {
          const profile = yield* Effect.promise(() =>
            getEnsProfileInternal(client, params),
          );

          return profile;
        }),
      getPrice: (name, duration) =>
        Effect.promise(async () => {
          const durationInSeconds = parseDuration(duration).pipe(
            Duration.toSeconds,
          );
          const res = await client.getPrice({
            duration: durationInSeconds,
            nameOrNames: name,
          });

          return {
            base: humanizeWeiUnits(res.base),
            premium: humanizeWeiUnits(res.premium),
            total: humanizeWeiUnits(res.base + res.premium),
          };
        }),
      isNameAvailable: (name) =>
        Effect.promise(() => client.getAvailable({ name })),
    };
  }),
);
