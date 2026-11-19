import { Layer } from "effect";
import { McpTest } from "effect/ai";

import type { Ens } from "@thenamespace/ens-mcp/internal/ens/Ens";
import { protocols } from "@thenamespace/ens-mcp/internal/server/options";
import { registrations } from "@thenamespace/ens-mcp/internal/server/registrations";

/** An in-memory MCP client of the server, reading ENS through `ens`. */
export const mcpClient = <E>(ens: Layer.Layer<Ens, E>) =>
  McpTest.makeClient(registrations.pipe(Layer.provide(ens)), { protocols });
