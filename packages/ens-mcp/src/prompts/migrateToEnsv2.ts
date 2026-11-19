import { Effect, Layer, Schema } from "effect";
import { McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { writeRules } from "./writeRules.js";

/** Explains whether and how a name can move to ENSv2, then prepares the move. */
export const MigrateToEnsv2Prompt = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;

    return McpServer.prompt({
      name: "migrate_to_ensv2",
      title: "Move a name to ENSv2",
      description:
        "Check whether an ENSv1 name can move to ENSv2, explain the options and prepare it",
      parameters: {
        name: Schema.String.annotate({ description: "The ENSv1 name, e.g. alice.eth" }),
        account: Schema.optionalKey(Schema.String).annotate({
          description: "Address or ENS name that holds the name and will sign",
        }),
      },
      completion: { name: completeName(ens) },
      content: ({ name, account }) =>
        Effect.succeed(
          `Help me move ${name} from ENSv1 to ENSv2.\n\n` +
            `1. Call get_migration_status for ${name}${account === undefined ? "" : ` with account ${account}`}. ` +
            "If it is already migrated or not required, say so and stop. If it is blocked, " +
            "explain each blocker and what would clear it.\n" +
            "2. Explain what changes: the route, what happens to the resolver and records (the " +
            "resolver options new, shared or keep), the roles and expiry it gets, and which " +
            "records and subnames carry over.\n" +
            "3. Tell me plainly that migration is one-way, and wait for my confirmation and my " +
            "choice of resolver.\n" +
            `4. Prepare it with migrate_name.\n\n${writeRules}`,
        ),
    });
  }),
);
