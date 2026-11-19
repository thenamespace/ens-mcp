import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account } from "../../../schemas/Address.js";
import { Coin } from "../../../schemas/Coin.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares setting an account's primary name. */
export const SetPrimaryName = Tool.make("set_primary_name", {
  description:
    "Prepare setting the primary ENS name of an account (reverse record) for the user to sign in " +
    "their own wallet, e.g. 'Make alice.eth my primary name'. Nothing is sent. The name should " +
    "resolve to the account, or apps will not show it; the result warns when it does not. Set " +
    "coin for a primary name on an L2 such as base or op.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    coin: Schema.optionalKey(Coin).annotate({
      description: "Chain of the primary name, e.g. base or op. Default: eth",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare setting a primary name")
  .annotateMerge(ReadsEns);
