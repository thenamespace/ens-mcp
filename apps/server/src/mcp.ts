import { Effect, Layer } from "effect";
import { McpServer } from "effect/unstable/ai";

import { EnsLive } from "./ens";
import {
  EnsPublicActionsTools,
  EnsPublicActionsToolsHandlers,
  EnsSubgraphActionsTools,
  EnsSubgraphActionsToolsHandlers,
} from "./tools";

export const McpLive = Layer.effectDiscard(
  McpServer.registerToolkit(EnsPublicActionsTools),
).pipe(
  Layer.provideMerge(
    Layer.effectDiscard(McpServer.registerToolkit(EnsSubgraphActionsTools)),
  ),
  Layer.provideMerge(EnsPublicActionsToolsHandlers),
  Layer.provideMerge(EnsSubgraphActionsToolsHandlers),
  Layer.provideMerge(EnsLive),
);
