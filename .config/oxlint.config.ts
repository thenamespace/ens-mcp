import { presets } from "@effect/tsgo/oxlint-presets";

import config from "klarity/oxlint";
import { defineConfig } from "oxlint";

// The Effect presets (and `typeAware`) need the oxlint and tsgolint binaries patched by
// `effect-tsgo patch --oxlint`, which `pnpm install` runs through `prepare`.
export default defineConfig({
  extends: [
    config,
    presets.correctness,
    presets.antipattern,
    presets.effectNative,
    presets.style,
    presets.maintainers,
  ],
  rules: {
    // `_tag` is Effect's discriminant for tagged errors and services.
    "no-underscore-dangle": ["error", { allow: ["_tag"] }],
    // Helpers take their subject first, like ensforge's actions; data-last overloads would add
    // signatures no caller pipes through.
    "effecttsgo/missing-pipeable-signature": "off",
  },
  overrides: [
    {
      // Tests run through @effect/vitest only (it re-exports vitest's API).
      files: ["**/test/**", "**/tests/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          { paths: [{ name: "vitest", message: "Import from @effect/vitest instead." }] },
        ],
      },
    },
    {
      // Only published entries are public API. @thenamespace/ens-mcp ships a binary and no library
      // entry, and the test and tool packages are private, so they have no stability to leak.
      files: ["**/src/internal/**", "**/packages/ens-mcp/**", "**/tests/**", "**/tools/**"],
      rules: { "effecttsgo/api-stability-leak": "off" },
    },
  ],
});
