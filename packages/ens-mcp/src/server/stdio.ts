import { NodeStdio } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { McpServer } from "effect/ai";

import { Ens } from "../ens/Ens.js";
import { PackageInfo } from "../PackageInfo.js";
import type { Toolset } from "../Toolset.js";
import { serverOptions } from "./options.js";
import { registrations } from "./registrations.js";

/** Serves MCP over stdin and stdout, the way local clients launch the server. */
export const StdioServer = (options: { readonly toolsets: ReadonlyArray<Toolset> }) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const { version } = yield* PackageInfo;
      const ens = yield* Ens;
      const server = serverOptions({
        version,
        chain: ens.chain,
        toolsets: options.toolsets,
        hasIndexer: ens.hasIndexer,
      });
      return McpServer.layerStdio({
        ...server,
        registrations: registrations(options.toolsets),
      });
    }),
  ).pipe(Layer.provide(NodeStdio.layer));
