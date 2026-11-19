import { describe, expect, it } from "@effect/vitest";
import { Array as Arr, Effect } from "effect";

import { Indexer } from "@ensforge/sdk/effect";
import type { Toolset } from "@thenamespace/ens-mcp/internal/Toolset";

import { mcpClient } from "../support/client.ts";
import { offlineEns, OfflineEns } from "../support/ens.ts";

const indexer = Indexer.define({ id: "test" });

const promptNames = (toolsets: ReadonlyArray<Toolset>) =>
  mcpClient({ ens: offlineEns({ indexer }), toolsets }).pipe(
    Effect.flatMap((client) => client.listPrompts()),
    Effect.map(({ prompts }) => Arr.map(prompts, (prompt) => prompt.name)),
  );

const promptText = (
  client: Effect.Success<ReturnType<typeof mcpClient>>,
  name: string,
  args: Record<string, string>,
) =>
  Effect.map(client.getPrompt({ name, arguments: args }), ({ messages }) =>
    Arr.join(
      Arr.map(messages, (message) => ("text" in message.content ? message.content.text : "")),
      "\n",
    ),
  );

describe("prompts", () => {
  it.effect("are offered with the toolsets whose tools they use", () =>
    Effect.gen(function* () {
      const [none, defaults, all] = yield* Effect.all(
        [
          promptNames([]),
          promptNames(["lookup", "lists", "register", "utils"]),
          promptNames(["lookup", "lists", "register", "manage", "advanced", "utils"]),
        ],
        { concurrency: "unbounded" },
      );

      expect(none).toEqual(["explain_ens_error"]);
      expect(defaults).toEqual(
        expect.arrayContaining(["register_a_name", "renew_expiring_names", "audit_name"]),
      );
      expect(defaults).not.toContain("set_up_profile");
      expect(all).toHaveLength(8);
    }),
  );

  it.effect("leave out the indexer prompts without an indexer", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({
        ens: OfflineEns,
        toolsets: ["lookup", "lists", "register"],
      });

      const { prompts } = yield* client.listPrompts();

      expect(Arr.map(prompts, (prompt) => prompt.name)).not.toContain("portfolio_review");
    }),
  );

  it.effect("fill in optional arguments, or ask for them", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["register"] });

      const bare = yield* promptText(client, "register_a_name", { name: "alice.eth" });
      const full = yield* promptText(client, "register_a_name", {
        name: "alice.eth",
        duration: "2 years",
        account: "nick.eth",
      });

      expect(bare).toContain("register alice.eth on ENS for 1 year");
      expect(bare).toContain("Ask which account will sign and pay");
      expect(full).toContain("for 2 years");
      expect(full).toContain("The account is nick.eth");
      expect(full).toContain("get_plan_status");
    }),
  );

  it.effect("reject a call without a required argument", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: ["register"] });

      const error = yield* Effect.flip(
        client.getPrompt({ name: "register_a_name", arguments: {} }),
      );

      expect(error.message).toContain("name");
    }),
  );

  it.effect("complete error codes and point at their reference", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const completed = yield* client.complete({
        ref: { type: "ref/prompt", name: "explain_ens_error" },
        argument: { name: "code", value: "plan_c" },
      });
      const text = yield* promptText(client, "explain_ens_error", { code: "missing_roles" });

      expect(completed.completion.values).toEqual(["PLAN_CHAIN_MISMATCH"]);
      expect(text).toContain("ens://errors/MISSING_ROLES");
    }),
  );
});
