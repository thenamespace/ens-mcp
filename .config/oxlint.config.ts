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
      // Only the published entries are public API: internal modules and the private test and tool
      // packages have no stability to leak.
      files: ["**/src/internal/**", "**/tests/**", "**/tools/**"],
      rules: { "effecttsgo/api-stability-leak": "off" },
    },
  ],
});
