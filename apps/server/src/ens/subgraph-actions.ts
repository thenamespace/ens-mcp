import { Effect, Layer, ServiceMap } from "effect";

import { EnsClient } from "./ens-client";
import { nameToGenericName } from "./helpers";
import type {
  GetNamesForAddressParams,
  GetNamesForAddressResponse,
  GetSubnamesForNameParams,
  GetSubnamesForNameResponse,
} from "./schema";

export type EnsSubgraphActions = {
  getSubnamesForName: (
    params: GetSubnamesForNameParams,
  ) => Effect.Effect<GetSubnamesForNameResponse>;
  getNamesForAddress: (
    params: GetNamesForAddressParams,
  ) => Effect.Effect<GetNamesForAddressResponse>;
};

export const EnsSubgraphActions =
  ServiceMap.Service<EnsSubgraphActions>("EnsSubgraphActions");

export const EnsSubgraphActionsLive = Layer.effect(
  EnsSubgraphActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    client.getNamesForAddress({
      address: "0x0",
      filter: {},
      orderBy: "createdAt",
      orderDirection: "asc",
      pageSize: 100,
    });

    return {
      getNamesForAddress: (params) =>
        Effect.gen(function* () {
          const res = yield* Effect.promise(() =>
            client.getNamesForAddress(params),
          );
          return { names: res.map(nameToGenericName) };
        }),
      getSubnamesForName: (params) =>
        Effect.gen(function* () {
          const res = yield* Effect.promise(() => client.getSubnames(params));
          return { subnames: res.map(nameToGenericName) };
        }),
    };
  }),
);
