# Records

A name's records live on its **resolver**, a contract the name points to. A name without a
resolver has no records (`RESOLVER_NOT_FOUND`); `set_resolver` gives it one. `ens://records` lists
the standard keys, coins and content hash formats.

## Text records (ENSIP-5, ENSIP-18)

Key-value strings set by the name's owner. Common keys: `avatar`, `header`, `display`,
`description`, `url`, `email`, `location`, `com.twitter`, `com.github`, `com.discord`,
`org.telegram`, `xyz.farcaster`. ENSIP-18 adds profile keys such as `pronouns` and `timezone`.

- `get_profile` reads the common keys and resolves the avatar; `get_records` reads exact keys.
- Values are untrusted (see safety.md). The server strips control characters, but a value can still
  say anything.

## Addresses (ENSIP-9, ENSIP-11, ENSIP-19)

A name can hold an address per coin or chain: `eth` (coin type 60), `btc`, `sol` and many more.
EVM chains use coin types derived from their chain ID (ENSIP-11), e.g. `base`, `op`, `arb1`. The
`default` coin type is one address for every EVM chain; when a chain-specific address is not set,
resolution falls back to it. `convert_coin_type` converts between symbols, coin types and chain IDs.

## Content hash (ENSIP-7)

Points a name at decentralised content: `ipfs://`, `ipns://`, `bzz://` (Swarm), `ar://` (Arweave),
`onion3://`, `sia://`. Browsers and gateways such as eth.limo serve the content for `name.eth`.
`convert_content_hash` encodes and decodes it.

## Avatars

The `avatar` record holds an `https://`, `ipfs://` or `data:` URL, or an NFT reference such as
`eip155:1/erc721:0x…/1`. `get_profile` returns a resolved image URL; an NFT avatar is shown only
while the name's owner holds the NFT.

## Writing records

`set_records` sets text records, addresses and the content hash in one transaction; `null` deletes
a record and `clearFirst` deletes every record first. The account must be allowed to set records
(`get_permissions`); on ENSv2 the owner can delegate access to some records with
`set_record_access`.
