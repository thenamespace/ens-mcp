import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Chains } from "../../ens/Chains.js";
import { ResolveName, resolveName } from "./resolveName.js";

const LookupToolkit = Toolkit.make(ResolveName);

/** Registers the `lookup` tools: resolve names, primary names, profiles and name details. */
export const LookupTools = McpServer.toolkit(LookupToolkit).pipe(
  Layer.provide(
    LookupToolkit.toLayer(
      Effect.gen(function* () {
        const chains = yield* Chains;
        return { resolve_name: resolveName(chains) };
      }),
    ),
  ),
);
