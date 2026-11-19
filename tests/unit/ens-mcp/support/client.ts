import { Layer } from "effect";
import { McpTest } from "effect/ai";

import type { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";
import { protocols } from "@thenamespace/ens-mcp/internal/server/options";
import { registrations } from "@thenamespace/ens-mcp/internal/server/registrations";
import { Toolset, type Toolset as ToolsetName } from "@thenamespace/ens-mcp/internal/Toolset";

/** An in-memory MCP client of the server with `toolsets` (default all), reading ENS through `ens`. */
export const mcpClient = <E>(options: {
  readonly ens: Layer.Layer<Ens, E>;
  readonly toolsets?: ReadonlyArray<ToolsetName>;
}) =>
  McpTest.makeClient(
    registrations(options.toolsets ?? Toolset.literals).pipe(Layer.provide(options.ens)),
    { protocols },
  );
