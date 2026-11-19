import { Effect, Layer, Schema } from "effect";
import { McpServer } from "effect/ai";

import { Ens } from "../ens/Ens.js";
import { writeRules } from "./writeRules.js";

/** Finds an address's names that expire soon and prepares renewing the chosen ones. */
const Registration = McpServer.prompt({
  name: "renew_expiring_names",
  title: "Renew expiring names",
  description: "Find an address's names that expire soon and renew the ones I choose",
  parameters: {
    address: Schema.String.annotate({ description: "Address or ENS name whose names to check" }),
    withinDays: Schema.optionalKey(Schema.String).annotate({
      description: "How far ahead to look, in days (default 90)",
    }),
  },
  content: ({ address, withinDays }) =>
    Effect.succeed(
      `Find the ENS names of ${address} that expire in the next ${withinDays ?? "90"} days, ` +
        "including any already in their grace period.\n\n" +
        "1. Call list_expiring_names. List each name with its expiry and days left, soonest " +
        "first, and flag names in their grace period: they are lost if not renewed in time.\n" +
        "2. Ask which names to renew and for how long, then price them with get_price (kind " +
        "renewal).\n" +
        "3. Ask which account will pay (anyone can renew any name), then prepare it with " +
        `renew_names.\n\n${writeRules}`,
    ),
});

/** Registers nothing without an indexer, like the list tools it uses. */
export const RenewExpiringNamesPrompt = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;
    return ens.hasIndexer ? Registration : Layer.empty;
  }),
);
