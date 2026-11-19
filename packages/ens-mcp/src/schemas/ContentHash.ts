import { Schema } from "effect";

/** A decoded content hash (ENSIP-7): where the name's website or content lives. */
export const ContentHash = Schema.Struct({
  protocol: Schema.String.annotate({ description: "ipfs, ipns, bzz, ar, onion, onion3 or sia" }),
  uri: Schema.String.annotate({ description: "Content URI, e.g. ipfs://…" }),
});
