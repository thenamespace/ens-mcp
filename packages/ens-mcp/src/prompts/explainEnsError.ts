import { Array as Arr, Effect, Schema, String as Str } from "effect";
import { McpServer } from "effect/ai";

import { errorCatalog } from "../resources/reference/errorCatalog.js";

/** Explains an error code from a tool and proposes the fix. */
export const ExplainEnsErrorPrompt = McpServer.prompt({
  name: "explain_ens_error",
  title: "Explain an ENS error",
  description: "Explain an error code a tool returned and how to fix it",
  parameters: {
    code: Schema.String.annotate({ description: "The error code, e.g. MISSING_ROLES" }),
    context: Schema.optionalKey(Schema.String).annotate({
      description: "What was being done when it happened",
    }),
  },
  completion: {
    code: (input) =>
      Effect.succeed(
        Arr.map(
          Arr.filter(errorCatalog, (entry) => Str.startsWith(Str.toUpperCase(input))(entry.code)),
          (entry): string => entry.code,
        ),
      ),
  },
  content: ({ code, context }) =>
    Effect.succeed(
      `A tool returned the ENS error ${Str.toUpperCase(code)}` +
        `${context === undefined ? "" : ` while ${context}`}.\n\n` +
        `Read ens://errors/${Str.toUpperCase(code)} for what it means and the next step. Explain ` +
        "it in plain words, check the current state with the read tools when that helps (for " +
        "example get_name_details or get_permissions), and propose the fix. If the fix is a " +
        "change, offer to prepare it.",
    ),
});
