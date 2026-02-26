import { McpServer } from "@effect/ai";
import { Layer } from "effect";

import { EnsLive } from "./ens";
import { EnsPublicActionsTools, EnsPublicActionsToolsHandlers } from "./tools";

export const McpLive = McpServer.toolkit(EnsPublicActionsTools).pipe(
  Layer.provideMerge(EnsPublicActionsToolsHandlers),
  Layer.provideMerge(EnsLive),
);
