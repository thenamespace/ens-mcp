import { Effect, Schema } from "effect";

import { EnsToolError } from "../ens/errors.js";

/**
 * Resource content: `read`'s result as JSON in `schema`'s encoding, the same as a tool's structured
 * content. MCP reports a failed read by message only, so an ENS error's code and hint go into it.
 */
export const json = <S extends Schema.Codec<unknown, unknown>, R>(
  schema: S,
  read: Effect.Effect<S["Type"], EnsToolError, R>,
) =>
  read.pipe(
    Effect.mapError((error) =>
      EnsToolError.make({
        code: error.code,
        message: `${error.code}: ${error.message}${error.hint === undefined ? "" : ` ${error.hint}`}`,
        retryable: error.retryable,
        docsUrl: error.docsUrl,
      }),
    ),
    Effect.flatMap((value) =>
      Effect.orDie(Schema.encodeEffect(Schema.fromJsonString(schema))(value)),
    ),
  );
