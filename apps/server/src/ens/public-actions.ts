/** biome-ignore-all lint/suspicious/noExplicitAny: safe */
import { Duration, Effect, Layer, ServiceMap } from "effect";
import type { Address } from "viem";

import { humanizeWeiUnits, parseDuration } from "@/helpers";

import { EnsClient } from "./ens-client";
import type { FormattedNamePrice } from "./schema";

export type EnsPublicActions = {
  getOwner: (name: string) => Effect.Effect<Address | undefined>;
  isNameAvailable: (name: string) => Effect.Effect<boolean>;
  getPrice: (
    name: string,
    duration: string,
  ) => Effect.Effect<FormattedNamePrice>;
};

export const EnsPublicActions =
  ServiceMap.Service<EnsPublicActions>("EnsPublicActions");

export const EnsPublicActionsLive = Layer.effect(
  EnsPublicActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    return {
      getOwner: (name) =>
        Effect.promise(async () => {
          const res = await client.getOwner({ name });
          return res?.owner;
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
