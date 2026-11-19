import type { Errors } from "@ensforge/sdk/effect";

/**
 * Next steps for codes whose ensforge copy is written for app users, rewritten for a model using
 * this server: they name its tools and settings. Other codes keep ensforge's copy.
 */
export const hints: NonNullable<Errors.DescribeOptions["messages"]> = {
  RATE_LIMITED: () => ({
    action: "Retry in a moment. The server's RPC is rate limited; set ENS_MCP_RPC_URL to avoid it.",
  }),
  RPC_TIMEOUT: () => ({
    action: "Retry. If it keeps failing, the server's RPC (ENS_MCP_RPC_URL) is slow or down.",
  }),
  RPC_REQUEST_FAILED: () => ({
    action: "Retry. If it keeps failing, the server's RPC (ENS_MCP_RPC_URL) is unreachable.",
  }),
  INDEXER_UNAVAILABLE: () => ({
    action: "Retry shortly; get_indexer_status shows whether the indexer is up.",
  }),
  INDEXER_BEHIND: () => ({
    action: "Retry shortly, or read the name on-chain with get_name_details.",
  }),
  INDEXER_UNSUPPORTED: () => ({
    action: "The indexer cannot answer this query. Basenames are only available on mainnet.",
  }),
  RECORD_NOT_FOUND: () => ({
    action: "Give the address itself, or a name whose ETH address is set.",
  }),
  RESOLVER_NOT_FOUND: (error) => ({
    action: `${error.context.name ?? "The name"} has no resolver, so it has no records yet.`,
  }),
};
