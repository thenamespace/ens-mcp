import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address, Addresses } from "../../../schemas/Address.js";
import { Coin } from "../../../schemas/Coin.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

const Found = Schema.Struct({
  address: Address,
  name: Schema.NullOr(Name).annotate({ description: "The primary name; null when it has none" }),
});

const Failed = Schema.Struct({ address: Address, error: EnsToolError });

/** Finds the ENS names addresses use as their primary name. */
export const GetPrimaryName = Tool.make("get_primary_name", {
  description:
    "Find the ENS name an address uses (reverse resolution), e.g. 'Which ENS name does 0xd8dA… " +
    "have?'. Takes up to 50 addresses. A name counts only if it resolves back to the address, so " +
    "a reverse record cannot claim someone else's name. Returns null for an address without a " +
    "primary name.",
  parameters: Schema.Struct({
    addresses: Addresses,
    coin: Schema.optionalKey(Coin).annotate({
      description:
        "Chain of the primary name, e.g. base or op for a name set on that L2. Default: eth",
    }),
  }),
  success: Schema.Struct({
    coin: Coin,
    results: Schema.Array(Schema.Union([Found, Failed])),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Get primary ENS names")
  .annotateMerge(ReadsEns);
