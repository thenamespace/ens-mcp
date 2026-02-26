import { createTsdownConfig } from "@repo/config/tsdown";

export default createTsdownConfig({
  banner: {
    js: "#!/usr/bin/env node",
  },
  entry: ["src/cli.ts"],
});
