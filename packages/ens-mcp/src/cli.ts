import { Array as Arr, Config, Layer, String as Str } from "effect";
import { Command, Flag } from "effect/cli";

import { Chain } from "./ens/Chain.js";
import { Ens } from "./ens/Ens.js";
import { HttpServer } from "./server/http.js";
import { StdioServer } from "./server/stdio.js";
import { defaultToolsets, Toolsets } from "./Toolset.js";

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
  Flag.withDescription("Chain to read ENS from: mainnet or sepolia (env: ENS_MCP_CHAIN)"),
);

const rpcUrl = Flag.Redacted("rpc-url").pipe(
  Flag.withFallbackConfig(Config.Redacted("ENS_MCP_RPC_URL")),
  Flag.optional,
  Flag.withDescription("RPC URL for the chain; a public RPC when unset (env: ENS_MCP_RPC_URL)"),
);

const requireRpc = Flag.Boolean("require-rpc").pipe(
  Flag.withFallbackConfig(Config.Boolean("ENS_MCP_REQUIRE_RPC")),
  Flag.withDefault(false),
  Flag.withDescription("Refuse to start without an RPC URL (env: ENS_MCP_REQUIRE_RPC)"),
);

const indexer = Flag.Literals("indexer", ["bigname", "none"]).pipe(
  Flag.withFallbackConfig(Config.Literals(["bigname", "none"], "ENS_MCP_INDEXER")),
  Flag.withDefault("bigname"),
  Flag.withDescription(
    "Indexer for name lists and history; none disables those tools (env: ENS_MCP_INDEXER)",
  ),
);

const toolsets = Flag.String("toolsets").pipe(
  Flag.withSchema(Toolsets),
  Flag.withFallbackConfig(Config.schema(Toolsets, "ENS_MCP_TOOLSETS")),
  Flag.withDefault(defaultToolsets),
  Flag.withDescription(
    "Comma-separated toolsets to enable: lookup, lists, register, manage, advanced, utils, or all " +
      "(env: ENS_MCP_TOOLSETS). Default: lookup,lists,register,utils",
  ),
);

const flags = {
  http,
  host,
  port,
  allowedOrigins,
  chain,
  rpcUrl,
  requireRpc,
  indexer,
  toolsets,
};

/** `ens-mcp`: runs the ENS MCP server over stdio, or over HTTP with `--http`. */
export const cli = Command.make("ens-mcp", flags, (options) =>
  Layer.launch(
    (options.http ? HttpServer(options) : StdioServer(options)).pipe(
      Layer.provide(
        Ens.layer({
          chain: options.chain,
          rpcUrl: options.rpcUrl,
          requireRpc: options.requireRpc,
          indexer: options.indexer,
        }),
      ),
    ),
  ),
).pipe(Command.withDescription("MCP server for ENS (Ethereum Name Service)"));
