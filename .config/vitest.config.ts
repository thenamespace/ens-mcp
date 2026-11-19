import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Network-free unit tests of every package and tool, from `tests/unit/<package>`.
const unit = {
  extends: true as const,
  test: {
    name: "unit",
    include: ["tests/unit/**/*.test.ts"],
  },
};

export default defineConfig({
  // Project paths below are relative to the repository root, not this folder.
  root: fileURLToPath(new URL("..", import.meta.url)),
  // Tests run against package sources, not builds.
  resolve: { conditions: ["workspace-source"] },
  ssr: { resolve: { conditions: ["workspace-source"] } },
  test: {
    projects: [unit],
    passWithNoTests: true,
  },
});
