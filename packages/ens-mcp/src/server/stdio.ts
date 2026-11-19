import { NodeStdio } from "@effect/platform-node";
import { Effect, Layer, Logger } from "effect";
import { McpServer } from "effect/ai";

import { PackageInfo } from "../PackageInfo.js";
import { serverOptions } from "./options.js";
import { registrations } from "./registrations.js";

/** Serves MCP over stdin and stdout, the way local clients launch the server. */
export const StdioServer = Layer.unwrap(
  Effect.gen(function* () {
    const { version } = yield* PackageInfo;
    return McpServer.layerStdio({ ...serverOptions(version), registrations });
  }),
).pipe(
  Layer.provide(NodeStdio.layer),
  // Stdout carries JSON-RPC only; a log line there would break the client.
  Layer.provide(Layer.succeed(Logger.LogToStderr, true)),
);
