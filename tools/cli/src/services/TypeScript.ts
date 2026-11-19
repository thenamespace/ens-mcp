import { Context, Effect, Layer, Path } from "effect";

import type { ToolFailed } from "../errors.ts";
import { Tools } from "./Tools.ts";

/** Runs TypeScript 7's native `tsc`, the one the workspace's `prepare` patches for Effect. */
export class TypeScript extends Context.Service<
  TypeScript,
  {
    /** Runs `tsc` with `args` from `cwd`. */
    readonly tsc: (
      args: readonly string[],
      options?: { readonly cwd?: string; readonly inherit?: boolean },
    ) => Effect.Effect<string, ToolFailed>;
  }
>()("@ens-mcp/tools/TypeScript") {
  static readonly layer = Layer.effect(
    TypeScript,
    Effect.gen(function* () {
      const path = yield* Path.Path;
      const tools = yield* Tools;
      const typescriptManifest = yield* Effect.sync(() =>
        import.meta.resolve("typescript/package.json"),
      ).pipe(
        Effect.flatMap((url) => path.fromFileUrl(new URL(url))),
        Effect.orDie,
      );
      const tscBin = path.join(path.dirname(typescriptManifest), "bin/tsc");

      return TypeScript.of({
        tsc: (args, options = {}) => tools.run(process.execPath, [tscBin, ...args], options),
      });
    }),
  );
}
