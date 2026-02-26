/** biome-ignore-all lint/suspicious/noExplicitAny: safe */

import { Config, Context, Duration, Effect, Layer } from "effect";
import type { Address } from "viem";

import { humanizeWeiUnits, parseDuration } from "@/helpers";

import { EnsClient } from "./ens-client";
import type {
  EnsProfile,
  FormattedNamePrice,
  GetEnsProfileParams,
} from "./schema";

export type EnsPublicActionsType = {
  getOwner: (name: string) => Effect.Effect<Address | undefined>;
  isNameAvailable: (name: string) => Effect.Effect<boolean>;
  getPrice: (
    name: string,
    duration: string,
  ) => Effect.Effect<FormattedNamePrice>;
  // getEnsProfile: (params: GetEnsProfileParams) => Effect.Effect<EnsProfile>;
};

export class EnsPublicActions extends Context.Tag("EnsPublicActions")<
  EnsClient,
  EnsPublicActionsType
>() {}

export const EnsPublicActionsLive = Layer.effect(
  EnsPublicActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    return {
      // getEnsProfile: (params) =>
      //   Effect.gen(function* () {
      //     const textRecordsCall = params.textRecords;
      //     return {};
      //   }),
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
