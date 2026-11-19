import { Array as Arr, Config, Layer, String as Str } from "effect";
import { Command, Flag } from "effect/cli";

import { Chain, rpcUrlEnv } from "./ens/Chain.js";
import { Chains } from "./ens/Chains.js";
import { HttpServer } from "./server/http.js";
import { StdioServer } from "./server/stdio.js";

const http = Flag.Boolean("http").pipe(
  Flag.withDefault(false),
  Flag.withDescription("Serve Streamable HTTP at /mcp instead of stdio"),
);

const host = Flag.String("host").pipe(
  Flag.withFallbackConfig(Config.String("HOST")),
  Flag.withDefault("127.0.0.1"),
  Flag.withDescription("Interface to listen on with --http (env: HOST)"),
);

const port = Flag.Int("port").pipe(
  Flag.withFallbackConfig(Config.Port("PORT")),
  Flag.withDefault(8080),
  Flag.withDescription("Port to listen on with --http (env: PORT)"),
);

const allowedOrigins = Flag.String("allowed-origins").pipe(
  Flag.withFallbackConfig(Config.String("ENS_MCP_ALLOWED_ORIGINS")),
  Flag.withDefault(""),
  Flag.map((value) => Arr.filter(Arr.map(Str.split(",")(value), Str.trim), Str.isNonEmpty)),
  Flag.withDescription(
    "Comma-separated browser origins allowed to call /mcp (env: ENS_MCP_ALLOWED_ORIGINS)",
  ),
);

const chain = Flag.Literals("chain", Chain.literals).pipe(
  Flag.withFallbackConfig(Config.Literals(Chain.literals, "ENS_MCP_CHAIN")),
  Flag.withDefault("mainnet"),
  Flag.withDescription("Chain tools read when a call names none (env: ENS_MCP_CHAIN)"),
);

const rpcUrl = (network: Chain) =>
  Flag.Redacted(`${network}-rpc-url`).pipe(
    Flag.withFallbackConfig(Config.Redacted(rpcUrlEnv(network))),
    Flag.optional,
    Flag.withDescription(
      `RPC URL for ${network}; a public RPC when unset (env: ${rpcUrlEnv(network)})`,
    ),
  );

const requireRpc = Flag.Boolean("require-rpc").pipe(
  Flag.withFallbackConfig(Config.Boolean("ENS_MCP_REQUIRE_RPC")),
  Flag.withDefault(false),
  Flag.withDescription(
    "Refuse to start without an RPC URL for every chain (env: ENS_MCP_REQUIRE_RPC)",
  ),
);

const indexer = Flag.Literals("indexer", ["bigname", "none"]).pipe(
  Flag.withFallbackConfig(Config.Literals(["bigname", "none"], "ENS_MCP_INDEXER")),
  Flag.withDefault("bigname"),
  Flag.withDescription(
    "Indexer for name lists and history; none disables those tools (env: ENS_MCP_INDEXER)",
  ),
);

const flags = {
  http,
  host,
  port,
  allowedOrigins,
  chain,
  mainnetRpcUrl: rpcUrl("mainnet"),
  sepoliaRpcUrl: rpcUrl("sepolia"),
  requireRpc,
  indexer,
};

/** `ens-mcp`: runs the ENS MCP server over stdio, or over HTTP with `--http`. */
export const cli = Command.make("ens-mcp", flags, (options) =>
  Layer.launch(
    (options.http ? HttpServer(options) : StdioServer).pipe(
      Layer.provide(
        Chains.layer({
          defaultChain: options.chain,
          rpcUrls: { mainnet: options.mainnetRpcUrl, sepolia: options.sepoliaRpcUrl },
          requireRpc: options.requireRpc,
          indexer: options.indexer,
        }),
      ),
    ),
  ),
).pipe(Command.withDescription("MCP server for ENS (Ethereum Name Service)"));
