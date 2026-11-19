import { Schema } from "effect";

/** A text record key (ENSIP-5), such as `url`, `description` or `com.twitter`. */
export const TextKey = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(256)).annotate(
  {
    description: "Text record key (ENSIP-5), e.g. url, description, com.twitter",
    examples: ["url", "com.github"],
  },
);
