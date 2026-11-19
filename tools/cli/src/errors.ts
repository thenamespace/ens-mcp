import { Schema } from "effect";

/** A tool the CLI runs (tsc, a bundler) failed or could not start. */
export class ToolFailed extends Schema.TaggedError<ToolFailed, { readonly brand: unique symbol }>()(
  "ToolFailed",
  {
    tool: Schema.String,
    output: Schema.String,
  },
) {}

/** The package or repository is not set up as the CLI expects. */
export class SetupError extends Schema.TaggedError<SetupError, { readonly brand: unique symbol }>()(
  "SetupError",
  {
    message: Schema.String,
  },
) {}
