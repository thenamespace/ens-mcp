import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError, ItemError } from "../../../ens/errors.js";
import { Coin } from "../../../schemas/Coin.js";
import { Name, Names } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

const Resolved = Schema.Struct({
  name: Name,
  address: Schema.NullOr(Schema.String).annotate({
    description: "Address in the coin's own format; null when the name has none for the coin",
  }),
});

const Failed = Schema.Struct({ name: Name, error: ItemError });

/** Resolves ENS names to addresses. */
export const ResolveName = Tool.make("resolve_name", {
  description:
    "Resolve ENS names to addresses, e.g. 'What address is vitalik.eth?'. Takes up to 50 names and " +
    "returns each name's address for one coin: ETH by default, or another chain or currency such " +
    "as btc, base or sol. A name without an address for the coin returns null. For a name's full " +
    "profile (text records, avatar, website) use get_profile.",
  parameters: Schema.Struct({ names: Names, coin: Schema.optionalKey(Coin) }),
  success: Schema.Struct({
    coin: Coin,
    results: Schema.Array(Schema.Union([Resolved, Failed])),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Resolve ENS names")
  .annotateMerge(ReadsEns);
