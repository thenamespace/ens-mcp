import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { mcpClient } from "../../support/client.ts";
import { OfflineEns } from "../../support/ens.ts";

describe("resolve_name", () => {
  it.effect("reports an unknown coin as a tool error", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient(OfflineEns);

      const result = yield* client.callTool({
        name: "resolve_name",
        arguments: { names: ["vitalik.eth"], coin: "notacoin" },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toEqual([
        { type: "text", text: expect.stringContaining("INVALID_COIN_TYPE") },
      ]);
    }),
  );

  it.effect("fails invalid names one by one instead of the whole call", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient(OfflineEns);

      const result = yield* client.callTool({
        name: "resolve_name",
        arguments: { names: ["x..eth", "bad name.eth"] },
      });

      expect(result.isError).toBe(false);
      expect(result.structuredContent).toMatchObject({
        coin: "eth",
        results: [
          { name: "x..eth", error: { code: "INVALID_NAME" } },
          { name: "bad name.eth", error: { code: "INVALID_NAME" } },
        ],
      });
    }),
  );
});
