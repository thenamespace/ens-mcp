import { Schema } from "effect";

/**
 * An ENS name as the user wrote it, such as `nick.eth`. ENSIP-1 sets no length limit (labels over
 * 255 bytes are sent as their hash), and ensforge validates and normalises names (ENSIP-15), so
 * this schema only rejects empty input and input past a server limit against abuse.
 */
export const Name = Schema.String.check(Schema.isMinLength(1), Schema.isMaxLength(1024)).annotate({
  description: "ENS name as the user wrote it, e.g. nick.eth; normalised by the server (ENSIP-15)",
  examples: ["nick.eth"],
});

/** Up to 50 ENS names, for tools that look up many names in one call. */
export const Names = Schema.Array(Name)
  .check(Schema.isMinLength(1), Schema.isMaxLength(50))
  .annotate({ description: "1 to 50 ENS names as the user wrote them" });
