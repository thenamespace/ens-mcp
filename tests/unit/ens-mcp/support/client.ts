import { Layer } from "effect";
import { McpTest } from "effect/ai";

import type { Chains } from "@thenamespace/ens-mcp/internal/ens/Chains";
import { protocols } from "@thenamespace/ens-mcp/internal/server/options";
import { registrations } from "@thenamespace/ens-mcp/internal/server/registrations";

/** An in-memory MCP client of the server, reading ENS through `chains`. */
export const mcpClient = <E>(chains: Layer.Layer<Chains, E>) =>
  McpTest.makeClient(registrations.pipe(Layer.provide(chains)), { protocols });
