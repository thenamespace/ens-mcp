import { McpProtocol } from "effect/ai";

import { instructions } from "./instructions.js";

/**
 * Protocol revisions the server speaks, newest first. 2026-07-28 is stateless; the earlier ones keep
 * clients that have not moved to it working.
 */
export const protocols = [
  McpProtocol.v2026_07_28,
  McpProtocol.v2025_11_25,
  McpProtocol.v2025_06_18,
  McpProtocol.v2025_03_26,
] as const;

/** What the server tells clients about itself, shared by every transport. */
export const serverOptions = (version: string) => ({
  name: "ens-mcp",
  version,
  description: "ENS (Ethereum Name Service) names, records, ownership and registration",
  websiteUrl: "https://github.com/thenamespace/ens-mcp",
  instructions,
  protocols,
});
