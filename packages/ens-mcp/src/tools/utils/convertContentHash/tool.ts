import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Hex } from "../../../schemas/Hex.js";
import { Computes } from "../../annotations.js";

/** Converts between content hash URIs and their encoded record value. */
export const ConvertContentHash = Tool.make("convert_content_hash", {
  description:
    "Convert between a content hash URI (ipfs://, ipns://, bzz://, ar://, onion3://, sia://) and " +
    "the hex value stored in an ENS contenthash record (ENSIP-7), both ways, and give an HTTP " +
    "gateway URL for it. Give either uri or hex. Works offline.",
  parameters: Schema.Struct({
    uri: Schema.optionalKey(Schema.String).annotate({
      description: "Content URI, e.g. ipfs://bafy…",
    }),
    hex: Schema.optionalKey(Hex).annotate({ description: "Encoded contenthash record value" }),
  }).check(
    Schema.makeFilter(
      ({ uri, hex }) =>
        (uri === undefined) !== (hex === undefined) || "Give exactly one of uri or hex",
    ),
  ),
  success: Schema.Struct({
    protocol: Schema.String,
    uri: Schema.String,
    hex: Hex,
    gatewayUrl: Schema.String.annotate({ description: "An HTTP URL that serves the content" }),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Convert content hashes")
  .annotateMerge(Computes);
