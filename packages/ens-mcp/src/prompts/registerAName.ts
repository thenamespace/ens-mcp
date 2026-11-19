import { Effect, Layer, Schema } from "effect";
import { McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { writeRules } from "./writeRules.js";

/** Walks through registering a name, from availability to the second signature. */
export const RegisterANamePrompt = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;

    return McpServer.prompt({
      name: "register_a_name",
      title: "Register an ENS name",
      description: "Check a .eth name, explain the cost and prepare its registration",
      parameters: {
        name: Schema.String.annotate({ description: "The .eth name, e.g. alice.eth" }),
        duration: Schema.optionalKey(Schema.String).annotate({
          description: "How long, e.g. 1 year (default) or 2 years",
        }),
        account: Schema.optionalKey(Schema.String).annotate({
          description: "Address or ENS name that will sign and pay",
        }),
      },
      completion: { name: completeName(ens) },
      content: ({ name, duration, account }) =>
        Effect.succeed(
          `Help me register ${name} on ENS for ${duration ?? "1 year"}.\n\n` +
            `1. Call check_availability for ${name} with that duration. If it is taken, tell me ` +
            "who holds it and when it expires (get_name_details) and stop.\n" +
            "2. Tell me the price and any premium, that it is paid in USDC (or DAI) plus gas, and " +
            "that registering takes two signatures at least a minute apart, the second within " +
            "24 hours.\n" +
            `3. ${account === undefined ? "Ask which account will sign and pay. " : `The account is ${account}. `}` +
            "Ask whether to set records such as the ETH address, and whether to make it the " +
            "primary name.\n" +
            "4. Prepare it with register_name.\n" +
            `5. Once every step is confirmed, show the result with get_name_details.\n\n${writeRules}`,
        ),
    });
  }),
);
