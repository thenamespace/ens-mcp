import { Array as Arr, Cause, Effect, Layer, Option, Schema, String as Str } from "effect";
import { McpSchema, McpServer } from "effect/ai";

import { errorCatalog, type ErrorEntry } from "./errorCatalog.js";

const toJson = (value: ErrorEntry | ReadonlyArray<ErrorEntry>) =>
  Effect.orDie(Schema.encodeEffect(Schema.fromJsonString(Schema.Unknown))(value));

const code = McpSchema.param("code", Schema.String);

/** Every error code the tools report, and each code alone, with its meaning and next step. */
export const ErrorResources = Layer.mergeAll(
  McpServer.resource({
    uri: "ens://errors",
    name: "ENS error codes",
    description:
      "Every error code the tools report: its category, what it means, what to do next and its " +
      "documentation",
    mimeType: "application/json",
    content: toJson(errorCatalog),
  }),
  McpServer.resource`ens://errors/${code}`({
    name: "ENS error code",
    description: "One error code: what it means, what to do next and its documentation",
    mimeType: "application/json",
    completion: {
      code: (input) =>
        Effect.succeed(
          Arr.map(
            Arr.filter(errorCatalog, (entry) => Str.startsWith(Str.toUpperCase(input))(entry.code)),
            (entry): string => entry.code,
          ),
        ),
    },
    content: (_uri, value) =>
      Option.match(
        Arr.findFirst(errorCatalog, (entry) => entry.code === Str.toUpperCase(value)),
        {
          onNone: () =>
            Effect.fail(
              new Cause.NoSuchElementError(
                `Unknown error code ${value}; ens://errors lists them all.`,
              ),
            ),
          onSome: toJson,
        },
      ),
  }),
);
