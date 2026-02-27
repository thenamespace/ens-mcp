import { Layer } from "effect";
import { McpServer } from "effect/unstable/ai";

import { EnsLive } from "./ens";
import { EnsPublicActionsTools, EnsPublicActionsToolsHandlers } from "./tools";

export const McpLive = McpServer.toolkit(EnsPublicActionsTools).pipe(
  Layer.provideMerge(EnsPublicActionsToolsHandlers),
  Layer.provideMerge(EnsLive),
);
