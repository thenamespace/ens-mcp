# Glossary

- **Name**: a dot-separated identifier such as `alice.eth`, normalised with ENSIP-15.
- **Label**: one part of a name between dots, e.g. `alice`.
- **labelhash / namehash**: keccak256 of a label / the recursive hash of a whole name (ENSIP-1).
- **Resolver**: the contract holding a name's records.
- **Record**: a value on the resolver: text record, address per coin, content hash.
- **Primary name**: the name an address chooses to be shown as (reverse resolution). It counts only
  when the name resolves back to the address.
- **Registrant**: ENSv1 holder of a `.eth` registration (ERC-721 token).
- **Manager**: ENSv1 registry owner of a name; sets its resolver, records and subnames.
- **Owner**: whoever ultimately controls a name.
- **NameWrapper / wrapped name**: ENSv1 contract that turns a name into an ERC-1155 token with fuses.
- **Fuse**: a permission burned into a wrapped name; permanent until it expires.
- **Emancipated / locked**: a subname whose parent burned `parentCannotControl` / a name with
  `cannotUnwrap` burned.
- **Expiry**: when a registration ends.
- **Grace period**: the time after expiry (90 days for ENSv1) when only renewal keeps the name.
- **Premium**: a temporary extra price on a name just released after its grace period.
- **Commitment**: the first registration step, a hash that hides the name until it is registered.
- **ENSv2**: the new ENS architecture: a registry per name level, roles instead of fuses and
  managers, PermissionedResolvers.
- **Registry / subregistry**: ENSv2 contract holding one level of names / the registry a name's
  subnames live in.
- **Role**: an ENSv2 permission held by an account on a name, e.g. `setResolver`; an `…Admin` role
  can grant it.
- **Operator / delegate**: an account approved for every name of an account on a contract / for
  one name's records.
- **Migration**: moving an ENSv1 name to ENSv2; one-way.
- **Coin type**: the number identifying a coin or chain for address records (ENSIP-9, ENSIP-11).
- **Content hash**: a pointer to decentralised content such as IPFS (ENSIP-7).
- **Indexer**: a service that indexes ENS events for lists and history; it can lag the chain.
- **Plan / plan handle**: a prepared set of transactions / the `ensplan1.…` string carrying it.
