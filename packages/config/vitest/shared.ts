import tsconfigPaths from "vite-tsconfig-paths";
import type { ViteUserConfig } from "vitest/config";
import { mergeConfig } from "vitest/config";

const isCI = process.env.CI === "true";

export const shared: ViteUserConfig = {
  esbuild: {
    target: "es2020",
  },
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      enabled: isCI,
      exclude: [
        "**/*.test.*",
        "**/*.spec.*",
        "**/__tests__/**",
        "**/*.d.ts",
        "**/dist/**",
        "**/build/**",
        "**/.turbo/**",
        "**/node_modules/**",
      ],
      include: ["packages/**/src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: isCI ? ["json", "lcov"] : ["text", "html"],
      reportsDirectory: "coverage",
    },
    fakeTimers: {
      toFake: undefined,
    },
    hookTimeout: 20_000,
    include: ["test/**/*.test.ts"],
    passWithNoTests: false,
    sequence: {
      concurrent: true,
    },
    testTimeout: 20_000,
  },
};

export function createVitestConfig(config?: ViteUserConfig) {
  return mergeConfig(shared, config ?? {});
}
