import { Schema } from "effect";

/** The server cannot start with its configuration; `message` says what to change. */
export class StartupError extends Schema.TaggedError<
  StartupError,
  { readonly brand: unique symbol }
>()("StartupError", {
  message: Schema.String,
}) {}
