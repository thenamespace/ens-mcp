import { Effect, Layer, Schema } from "effect";
import { McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { writeRules } from "./writeRules.js";

/** Reviews a name's profile and prepares the records to fill it in. */
export const SetUpProfilePrompt = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;

    return McpServer.prompt({
      name: "set_up_profile",
      title: "Set up an ENS profile",
      description: "Review a name's profile and prepare the records to complete it",
      parameters: {
        name: Schema.String.annotate({ description: "The ENS name, e.g. alice.eth" }),
        account: Schema.optionalKey(Schema.String).annotate({
          description: "Address or ENS name that will sign",
        }),
      },
      completion: { name: completeName(ens) },
      content: ({ name, account }) =>
        Effect.succeed(
          `Help me set up the ENS profile of ${name}.\n\n` +
            `1. Read its profile with get_profile and show what is set and what is missing: ` +
            "avatar, display name, description, website, email, socials (com.twitter, " +
            "com.github, xyz.farcaster…) and addresses (ETH and others I use). ens://records " +
            "lists the standard keys.\n" +
            "2. Ask me for the values to add or change. Do not invent any.\n" +
            `3. ${account === undefined ? "Ask which account will sign, then check" : `Check that ${account}`} may ` +
            "set records with get_permissions.\n" +
            "4. Prepare all changes in one set_records call.\n" +
            "5. If the name is not the account's primary name (get_primary_name) and I want it, " +
            `prepare set_primary_name too.\n\n${writeRules}`,
        ),
    });
  }),
);
