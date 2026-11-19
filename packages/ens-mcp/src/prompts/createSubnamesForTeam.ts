import { Effect, Layer, Schema } from "effect";
import { McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { writeRules } from "./writeRules.js";

/** Prepares a subname with an address record for each member of a team. */
export const CreateSubnamesForTeamPrompt = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;

    return McpServer.prompt({
      name: "create_subnames_for_team",
      title: "Create subnames for a team",
      description: "Give each team member a subname of a parent name, pointing at their address",
      parameters: {
        parent: Schema.String.annotate({ description: "The parent name, e.g. acme.eth" }),
        members: Schema.String.annotate({
          description: "label=address pairs, comma-separated, e.g. alice=0x…, bob=bob.eth",
        }),
      },
      completion: { parent: completeName(ens) },
      content: ({ parent, members }) =>
        Effect.succeed(
          `Create a subname of ${parent} for each team member: ${members}.\n\n` +
            `1. Check who controls ${parent} (get_name_details) and that the signing account may ` +
            "create subnames (get_permissions). Ask which account signs if unclear.\n" +
            "2. Check none of the subnames exists yet (list_subnames when available, or " +
            "get_name_details); list any that do and skip them unless I say otherwise.\n" +
            "3. Show the list of subnames with the address each will own and resolve to, and " +
            "wait for my confirmation.\n" +
            "4. Prepare create_subname for each, with the member as owner and their ETH address " +
            `record set.\n\n${writeRules}`,
        ),
    });
  }),
);
