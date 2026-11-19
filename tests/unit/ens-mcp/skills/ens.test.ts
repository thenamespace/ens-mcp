import { describe, expect, it } from "@effect/vitest";
import { Array as Arr, Effect, String as Str } from "effect";

import { mcpClient, readText } from "../support/client.ts";
import { OfflineEns } from "../support/ens.ts";

describe("ens skill", () => {
  it.effect("serves SKILL.md and its references as resources, whatever the toolsets", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const skill = yield* readText(client, "skill://ens/SKILL.md");
      const { resources } = yield* client.listResources();

      expect(skill).toMatch(/^---\nname: ens\ndescription: .+\n---\n/);
      expect(Arr.map(resources, (resource) => resource.uri)).toEqual(
        expect.arrayContaining([
          "skill://ens/references/registration.md",
          "skill://ens/references/safety.md",
        ]),
      );
    }),
  );

  it.effect("links only to references it ships", () =>
    Effect.gen(function* () {
      const client = yield* mcpClient({ ens: OfflineEns, toolsets: [] });

      const skill = yield* readText(client, "skill://ens/SKILL.md");
      const linked = Arr.map(
        Arr.fromIterable(Str.matchAll(/\]\((references\/[\w-]+\.md)\)/g)(skill)),
        ([, path]) => path,
      );
      const texts = yield* Effect.forEach(
        linked,
        (path) => readText(client, `skill://ens/${path}`),
        { concurrency: "unbounded" },
      );

      expect(linked.length).toBeGreaterThan(0);
      expect(Arr.every(texts, (text) => text.length > 0)).toBe(true);
    }),
  );
});
