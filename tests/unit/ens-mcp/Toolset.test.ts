import { describe, expect, it } from "@effect/vitest";
import { Array as Arr, Effect, Schema } from "effect";

import { Toolsets } from "@thenamespace/ens-mcp/internal/Toolset";

import { mcpClient } from "./support/client.ts";
import { OfflineEns } from "./support/ens.ts";

describe("toolsets", () => {
  it.effect("parses comma-separated lists and all", () =>
    Effect.gen(function* () {
      const decode = Schema.decodeUnknownEffect(Toolsets);

      const listed = yield* decode(" lookup, utils ");
      const all = yield* decode("all");
      const unknown = yield* Effect.flip(decode("lookup,nope"));

      expect(listed).toEqual(["lookup", "utils"]);
      expect(all).toHaveLength(6);
      expect(unknown.message).toContain(`Expected "lookup" | "lists"`);
    }),
  );

  it.effect("registers the tools of enabled toolsets only", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["utils"] });

      const { tools } = yield* client.listTools();

      expect(Arr.map(tools, (tool) => tool.name)).toEqual([
        "normalize_name",
        "convert_coin_type",
        "convert_content_hash",
      ]);
    }),
  );
});
