import { Layer } from "effect";

import { EnsClientLive } from "./ens-client";
import { EnsPublicActionsLive } from "./public-actions";
import { EnsSubgraphActionsLive } from "./subgraph-actions";

export const EnsLive = EnsPublicActionsLive.pipe(
  Layer.provideMerge(EnsSubgraphActionsLive),
  Layer.provideMerge(EnsClientLive),
);

export * from "./ens-client";
export * from "./public-actions";
export * from "./schema";
export * from "./subgraph-actions";
