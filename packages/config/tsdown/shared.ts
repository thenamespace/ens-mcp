import { defineConfig, mergeConfig, type UserConfig } from "tsdown";

const defaultConfig = defineConfig({
  clean: true,
  dts: {
    enabled: true,
    sourcemap: true,
  },
  format: ["esm"],
  outDir: "dist",
  platform: "node",
  shims: true,
  sourcemap: true,
  target: ["es2022"],
  treeshake: true,
});

export const createTsdownConfig = (overrides: UserConfig) => {
  return mergeConfig(defaultConfig, overrides);
};
