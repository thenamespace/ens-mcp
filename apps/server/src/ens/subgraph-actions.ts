import { Effect, Layer, ServiceMap } from "effect";

import { EnsClient } from "./ens-client";
import { nameToGenericName } from "./helpers";
import type {
  GetSubnamesForNameParams,
  GetSubnamesForNameResponse,
} from "./schema";

export type EnsSubgraphActions = {
  getSubnamesForName: (
    params: GetSubnamesForNameParams,
  ) => Effect.Effect<GetSubnamesForNameResponse>;
};

export const EnsSubgraphActions =
  ServiceMap.Service<EnsSubgraphActions>("EnsSubgraphActions");

export const EnsSubgraphActionsLive = Layer.effect(
  EnsSubgraphActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    return {
      getSubnamesForName: (params) =>
        Effect.gen(function* () {
          const res = yield* Effect.promise(() => client.getSubnames(params));
          return { subnames: res.map(nameToGenericName) };
        }),
    };
  }),
);
