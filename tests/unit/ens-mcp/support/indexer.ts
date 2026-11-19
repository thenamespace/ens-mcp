import type { IndexedName } from "@ensforge/sdk/indexer";

/** An indexed `.eth` name owned by `owner`, expiring at Unix second `expiresAt`. */
export const indexedName = (
  name: string,
  fields: Partial<IndexedName> & { readonly expiresAt?: bigint | null } = {},
): IndexedName => ({
  name,
  displayName: name,
  namespace: "ens",
  node: "0x0000000000000000000000000000000000000000000000000000000000000000",
  status: "active",
  authority: "ensV2",
  owner: "0xb8c2C29ee19D8307cb7255e1Cd9CbDE883A267d5",
  manager: null,
  registeredAt: null,
  createdAt: null,
  expiresAt: null,
  graceEndsAt: null,
  expiryReason: null,
  ensV1: null,
  ...fields,
});
