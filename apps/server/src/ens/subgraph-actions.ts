import { Effect, Layer, ServiceMap } from "effect";
import type { Address } from "viem";

import { EnsClient } from "./ens-client";
import { getNameHistoryInternal, nameToGenericName } from "./helpers";
import type {
  GetNameHistoryParams,
  GetNameHistoryResponse,
  GetNamesForAddressParams,
  GetNamesForAddressResponse,
  GetSubgraphRecordsParams,
  GetSubgraphRecordsResponse,
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
  getNameHistory: (
    params: GetNameHistoryParams,
  ) => Effect.Effect<GetNameHistoryResponse>;
  getSubgraphRecords: (
    params: GetSubgraphRecordsParams,
  ) => Effect.Effect<GetSubgraphRecordsResponse>;
};

export const EnsSubgraphActions =
  ServiceMap.Service<EnsSubgraphActions>("EnsSubgraphActions");

export const EnsSubgraphActionsLive = Layer.effect(
  EnsSubgraphActions,
  Effect.gen(function* () {
    const client = yield* EnsClient;

    return {
      getNameHistory: (params) =>
        Effect.gen(function* () {
          return yield* Effect.promise(() =>
            getNameHistoryInternal(client, params),
          );
        }),
      getNamesForAddress: (params) =>
        Effect.gen(function* () {
          const { address, ...rest } = params;
          const res = yield* Effect.promise(() =>
            client.getNamesForAddress({ address: address as Address, ...rest }),
          );
          return { names: res.map(nameToGenericName) };
        }),
      getSubgraphRecords: (params) =>
        Effect.gen(function* () {
          const res = yield* Effect.promise(() =>
            client.getSubgraphRecords(params),
          );
          return {
            coins: (res?.coins ?? []).map((c) => Number(c)),
            texts: res?.texts ?? [],
          };
        }),
      getSubnamesForName: (params) =>
        Effect.gen(function* () {
          const res = yield* Effect.promise(() => client.getSubnames(params));
          return { subnames: res.map(nameToGenericName) };
        }),
    };
  }),
);
