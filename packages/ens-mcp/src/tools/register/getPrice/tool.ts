import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Amount, PaymentToken } from "../../../schemas/Amount.js";
import { Duration } from "../../../schemas/Duration.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

/** Prices registering or renewing names. */
export const GetPrice = Tool.make("get_price", {
  description:
    "Get the price to register or renew .eth names for a duration, e.g. 'How much is renewing " +
    "nick.eth for 2 years?'. Prices are in USDC by default, or DAI; registration adds a " +
    "temporary premium on recently expired names. Returns each name's price and the total.",
  parameters: Schema.Struct({
    names: Schema.Array(Name)
      .check(Schema.isMinLength(1), Schema.isMaxLength(20))
      .annotate({ description: "1 to 20 .eth names" }),
    duration: Duration,
    kind: Schema.optionalKey(Schema.Literals(["registration", "renewal"])).annotate({
      description: "registration (default) or renewal",
    }),
    paymentToken: Schema.optionalKey(PaymentToken),
  }),
  success: Schema.Struct({
    kind: Schema.Literals(["registration", "renewal"]),
    duration: Schema.String,
    total: Amount,
    items: Schema.Array(
      Schema.Struct({
        name: Name,
        price: Amount,
        premium: Schema.optionalKey(Amount),
      }),
    ),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Get ENS prices")
  .annotateMerge(ReadsEns);
