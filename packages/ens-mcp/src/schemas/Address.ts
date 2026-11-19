import { Schema } from "effect";

import { isAddress } from "viem";

/** An Ethereum address: `0x` and 40 hex digits, lowercase or checksummed (EIP-55). */
export const Address = Schema.TemplateLiteral(["0x", Schema.String])
  .check(
    Schema.makeFilter((value: string) => isAddress(value) || "Expected an Ethereum address (0x…)"),
  )
  .annotate({
    description: "Ethereum address, 0x followed by 40 hex digits",
    examples: ["0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"],
  });

/** Up to 50 addresses, for tools that look up many addresses in one call. */
export const Addresses = Schema.Array(Address)
  .check(Schema.isMinLength(1), Schema.isMaxLength(50))
  .annotate({ description: "1 to 50 Ethereum addresses" });

/** An Ethereum address, or an ENS name standing for the address it resolves to. */
export const AddressOrName = Schema.String.check(Schema.isMinLength(1)).annotate({
  description: "Ethereum address (0x…) or an ENS name resolving to one, e.g. nick.eth",
  examples: ["0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5", "nick.eth"],
});

/** The account that will sign a prepared write: an address, or an ENS name resolving to one. */
export const Account = AddressOrName.annotate({
  description: "Account that will sign the transactions: an address (0x…) or an ENS name",
});
