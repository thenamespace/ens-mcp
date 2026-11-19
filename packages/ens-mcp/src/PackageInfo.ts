import { Context, Effect, FileSystem, Layer, Path, Schema } from "effect";

const Manifest = Schema.Struct({ version: Schema.String });

/** Facts about the installed package, read from its `package.json`. */
export class PackageInfo extends Context.Service<PackageInfo, { readonly version: string }>()(
  "@thenamespace/ens-mcp/PackageInfo",
) {
  static readonly layer = Layer.effect(
    PackageInfo,
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;

      // Sources (`src/`) and builds (`dist/`) both sit next to package.json.
      const file = yield* path.fromFileUrl(new URL("../package.json", import.meta.url));
      const manifest = yield* fs
        .readFileString(file)
        .pipe(Effect.flatMap(Schema.decodeUnknownEffect(Schema.fromJsonString(Manifest))));

      return PackageInfo.of(manifest);
    }).pipe(Effect.orDie),
  );
}
