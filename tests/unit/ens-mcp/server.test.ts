import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { McpTest } from "effect/ai";

import { PackageInfo } from "@thenamespace/ens-mcp/internal/PackageInfo";
import { protocols } from "@thenamespace/ens-mcp/internal/server/options";
import { registrations } from "@thenamespace/ens-mcp/internal/server/registrations";

describe("server", () => {
  it.effect("serves ping with the package version", () =>
    Effect.gen(function* () {
      const client = yield* McpTest.makeClient(
        registrations.pipe(Layer.provide(Layer.succeed(PackageInfo, { version: "1.2.3" }))),
        { protocols },
      );

      const result = yield* client.callTool({ name: "ping", arguments: {} });

      expect(result.isError).toBe(false);
      expect(result.structuredContent).toEqual({ version: "1.2.3" });
    }).pipe(Effect.scoped),
  );
});
