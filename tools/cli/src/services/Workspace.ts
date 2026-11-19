import { Context, Effect, FileSystem, Layer, Path, Schema } from "effect";

import { SetupError } from "../errors.ts";

const Manifest = Schema.Struct({ name: Schema.String });

/** The repository root and the package the command runs in (its working directory). */
export class Workspace extends Context.Service<
  Workspace,
  {
    readonly root: string;
    readonly packageDir: string;
    readonly name: string;
  }
>()("@ens-mcp/tools/Workspace") {
  static readonly layer = Layer.effect(
    Workspace,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const packageDir = process.cwd();

      let root = packageDir;
      while (!(yield* fs.exists(path.join(root, "pnpm-workspace.yaml")))) {
        const parent = path.dirname(root);
        if (parent === root)
          return yield* SetupError.make({ message: "Run inside the ens-mcp repository." });
        root = parent;
      }

      const manifest = yield* fs.readFileString(path.join(packageDir, "package.json")).pipe(
        Effect.flatMap(Schema.decodeUnknownEffect(Schema.fromJsonString(Manifest))),
        Effect.mapError((cause) => SetupError.make({ message: `package.json: ${String(cause)}` })),
      );

      return Workspace.of({ root, packageDir, name: manifest.name });
    }),
  );
}
