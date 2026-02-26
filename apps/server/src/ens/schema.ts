import { Schema } from "effect";

const PriceUnits = Schema.Struct({
  eth: Schema.String.annotate({
    description: "Amount in eth units",
  }),
  gwei: Schema.String.annotate({
    description: "Amount in gwei units",
  }),
  wei: Schema.String.annotate({
    description: "Amount in wei units",
  }),
});

export const FormattedNamePrice = Schema.Struct({
  base: PriceUnits.annotate({
    description: "Base price of the name",
  }),
  premium: PriceUnits.annotate({
    description: "Premium price of the name",
  }),
  total: PriceUnits.annotate({
    description: "Total price of the name",
  }),
});

export type FormattedNamePrice = typeof FormattedNamePrice.Type;
