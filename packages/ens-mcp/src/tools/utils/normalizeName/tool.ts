import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Hex } from "../../../schemas/Hex.js";
import { Name, Names } from "../../../schemas/Name.js";
import { Computes } from "../../annotations.js";

const Valid = Schema.Struct({
  input: Name,
  normalized: Name.annotate({ description: "The name normalised under ENSIP-15" }),
  labels: Schema.Array(Schema.String),
  parent: Schema.NullOr(Name),
  namehash: Hex.annotate({ description: "Namehash (ENSIP-1) of the normalised name" }),
  labelhash: Hex.annotate({ description: "Labelhash of the first label" }),
});

const Invalid = Schema.Struct({ input: Name, error: EnsToolError });

/** Normalises ENS names and computes their hashes. */
export const NormalizeName = Tool.make("normalize_name", {
  description:
    "Normalise ENS names (ENSIP-15) and compute their namehash and labelhash, e.g. 'Is " +
    "Nick.ETH a valid name?' or 'What is the namehash of ens.eth?'. Takes up to 50 names; an " +
    "invalid name returns an error explaining why. Other tools normalise names themselves: use " +
    "this to check spelling, look-alike characters or hashes. Works offline.",
  parameters: Schema.Struct({ names: Names }),
  success: Schema.Struct({ results: Schema.Array(Schema.Union([Valid, Invalid])) }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Normalise ENS names")
  .annotateMerge(Computes);
