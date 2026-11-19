import { Array as Arr, Config, Layer, String as Str } from "effect";
import { Command, Flag } from "effect/cli";

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

/** `ens-mcp`: runs the ENS MCP server over stdio, or over HTTP with `--http`. */
export const cli = Command.make("ens-mcp", { http, host, port, allowedOrigins }, (flags) =>
  Layer.launch(flags.http ? HttpServer(flags) : StdioServer),
).pipe(Command.withDescription("MCP server for ENS (Ethereum Name Service)"));
