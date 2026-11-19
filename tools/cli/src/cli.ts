import { Command } from "effect/cli";

import { buildCommand } from "./commands/build.ts";
import { skillsCommand } from "./commands/skills.ts";
import { tokensCommand } from "./commands/tokens.ts";

/**
 * `ens-mcp-dev`: build and check ens-mcp packages. `build` runs in a package folder; `skills` and
 * `tokens` run anywhere in the repository.
 */
export const cli = Command.make("ens-mcp-dev").pipe(
  Command.withDescription("Build and check ens-mcp packages"),
  Command.withSubcommands([buildCommand, skillsCommand, tokensCommand]),
);
