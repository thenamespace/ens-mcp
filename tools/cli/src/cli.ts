import { Command } from "effect/cli";

import { buildCommand } from "./commands/build.ts";

/** `ens-mcp-dev`: build and check ens-mcp packages. Package commands run in their folder. */
export const cli = Command.make("ens-mcp-dev").pipe(
  Command.withDescription("Build and check ens-mcp packages"),
  Command.withSubcommands([buildCommand]),
);
