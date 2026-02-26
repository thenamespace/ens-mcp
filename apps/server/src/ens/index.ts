import { Layer } from "effect";

import { EnsClientLive } from "./ens-client";
import { EnsPublicActionsLive } from "./public-actions";

export const EnsLive = EnsPublicActionsLive.pipe(
  Layer.provideMerge(EnsClientLive),
);

export * from "./ens-client";
export * from "./public-actions";
