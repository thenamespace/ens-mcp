import { McpProtocol } from "effect/ai";

import type { Chain } from "../ens/Chain.js";
import type { Toolset } from "../Toolset.js";
import { instructions } from "./instructions.js";

/**
 * Protocol revisions the server speaks, newest first: stateless 2026-07-28, and 2025-11-25 for
 * clients that have not moved to it yet.
 */
export const protocols = [McpProtocol.v2026_07_28, McpProtocol.v2025_11_25] as const;

// Lists change only when the server is redeployed with other tools.
const listsCache = { ttl: "1 hour", cacheScope: "private" } as const;

/** What the server tells clients about itself, shared by every transport. */
export const serverOptions = (options: {
  readonly version: string;
  readonly chain: Chain;
  readonly toolsets: ReadonlyArray<Toolset>;
  readonly hasIndexer: boolean;
}) => ({
  name: "ens-mcp",
  version: options.version,
  description: "ENS (Ethereum Name Service) names, records, ownership and registration",
  websiteUrl: "https://github.com/thenamespace/ens-mcp",
  instructions: instructions(options),
  protocols,
  cacheHints: {
    discover: listsCache,
    tools: listsCache,
    resources: listsCache,
    resourceTemplates: listsCache,
    prompts: listsCache,
  },
});
