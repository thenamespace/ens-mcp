import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

import { mcpClient } from "../../support/client.ts";
import { OfflineEns } from "../../support/ens.ts";

describe("get_records", () => {
  it.effect("asks for a record selection", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns });

      const result = yield* client.callTool({
        name: "get_records",
        arguments: { name: "nick.eth" },
      });

      expect(result.isError).toBe(true);
      expect(result.content).toEqual([
        { type: "text", text: expect.stringContaining("Select at least one record") },
      ]);
    }),
  );
});
