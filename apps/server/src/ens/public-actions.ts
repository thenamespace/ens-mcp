import { Effect, Layer, ServiceMap } from "effect";
import type { Address } from "viem";

import { EnsClient } from "./ens-client";

export type EnsPublicActions = {
  getOwner: (name: string) => Effect.Effect<Address | undefined>;
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
    };
  }),
);
