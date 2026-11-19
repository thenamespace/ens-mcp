import { McpProtocol } from "effect/ai";

import { instructions } from "./instructions.js";

/**
 * Protocol revisions the server speaks, newest first: stateless 2026-07-28, and 2025-11-25 for
 * clients that have not moved to it yet.
 */
export const protocols = [McpProtocol.v2026_07_28, McpProtocol.v2025_11_25] as const;

/** What the server tells clients about itself, shared by every transport. */
export const serverOptions = (version: string) => ({
  name: "ens-mcp",
  version,
  description: "ENS (Ethereum Name Service) names, records, ownership and registration",
  websiteUrl: "https://github.com/thenamespace/ens-mcp",
  instructions,
  protocols,
});
