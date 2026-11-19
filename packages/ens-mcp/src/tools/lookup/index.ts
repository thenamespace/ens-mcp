import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { ResolveName, resolveName } from "./resolveName.js";

const LookupToolkit = Toolkit.make(ResolveName);

/** Registers the `lookup` tools: resolve names, primary names, profiles and name details. */
export const LookupTools = McpServer.toolkit(LookupToolkit).pipe(
  Layer.provide(
    LookupToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return { resolve_name: resolveName(ens) };
      }),
    ),
  ),
);
