import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError, ItemError } from "../../../ens/errors.js";
import { Amount, PaymentToken } from "../../../schemas/Amount.js";
import { Duration } from "../../../schemas/Duration.js";
import { Name, Names } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

const Checked = Schema.Struct({
  name: Name,
  available: Schema.Boolean,
  price: Schema.optionalKey(Amount).annotate({ description: "Total price, when available" }),
  premium: Schema.optionalKey(Amount).annotate({
    description: "Part of the price that is a temporary premium on a recently expired name",
  }),
});

/** Checks whether names can be registered, and at what price. */
export const CheckAvailability = Tool.make("check_availability", {
  description:
    "Check whether .eth names can be registered and what they cost, e.g. 'Is alice.eth " +
    "available?'. Takes up to 50 names; available ones come with their price for the duration " +
    "(1 year by default), including any premium on a recently expired name. For who holds a " +
    "taken name, use get_name_details; to register one, use register_name.",
  parameters: Schema.Struct({
    names: Names,
    duration: Schema.optionalKey(Duration),
    paymentToken: Schema.optionalKey(PaymentToken),
  }),
  success: Schema.Struct({
    duration: Schema.String,
    results: Schema.Array(Schema.Union([Checked, Schema.Struct({ name: Name, error: ItemError })])),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Check name availability")
  .annotateMerge(ReadsEns);
