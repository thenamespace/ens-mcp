import { Effect, Layer, Schema } from "effect";
import { McpServer, Tool, Toolkit } from "effect/ai";

import { PackageInfo } from "../PackageInfo.js";

// Placeholder that proves the server end to end until the ENS tools land.
const Ping = Tool.make("ping", {
  description: "Checks that the ENS MCP server is reachable and returns its version.",
  success: Schema.Struct({ version: Schema.String }),
})
  .annotate(Tool.Title, "Ping")
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, false);

const PingToolkit = Toolkit.make(Ping);

/** Registers the `ping` tool. */
export const PingTools = McpServer.toolkit(PingToolkit).pipe(
  Layer.provide(
    PingToolkit.toLayer(
      Effect.gen(function* () {
        const { version } = yield* PackageInfo;
        return { ping: () => Effect.succeed({ version }) };
      }),
    ),
  ),
);
