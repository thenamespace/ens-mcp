import { Schema } from "effect";

/** Bytes as `0x`-prefixed hex. */
export const Hex = Schema.TemplateLiteral(["0x", Schema.String])
  .check(Schema.isPattern(/^0x(?:[0-9a-fA-F]{2})*$/))
  .annotate({ description: "Bytes as 0x-prefixed hex" });

/** An ERC-165 interface ID: four bytes, e.g. `0x01ffc9a7`. */
export const InterfaceId = Schema.TemplateLiteral(["0x", Schema.String])
  .check(Schema.isPattern(/^0x[0-9a-fA-F]{8}$/))
  .annotate({ description: "ERC-165 interface ID, 4 bytes as hex, e.g. 0x01ffc9a7" });
