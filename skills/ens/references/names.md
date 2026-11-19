# Names

## Normalisation

ENS names are normalised with ENSIP-15 before they are hashed: case folding, Unicode
normalisation, emoji handling and rejecting confusable or invalid characters. Two strings that look
alike can be different names, and some strings are not valid names at all.

- Pass names exactly as the user wrote them; the server normalises them and reports `INVALID_NAME`
  with a reason when a name cannot be normalised.
- `normalize_name` shows the normalised form, whether it changed, and its namehash and labelhash.
- Show the normalised name back to the user when it differs from what they typed.

## Labels and hashes

A name is a list of labels separated by dots: `pay.alice.eth` has the labels `pay`, `alice` and
`eth`.

- **labelhash**: keccak256 of one label.
- **namehash**: the recursive hash of the whole name (ENSIP-1); contracts identify names by it.
- When only a label's hash is known (the label itself was never published), indexers show it as
  `[0x…]`. Such names can be read but not always recreated or displayed.

## Second-level names and subnames

- `alice.eth` is a second-level `.eth` name: registered and paid for, and it expires.
- `pay.alice.eth` is a subname: created by whoever controls `alice.eth`, free, and its rules come
  from the parent (see ownership.md).
- DNS names such as `example.com` can be imported into ENS with DNSSEC (`get_dns_status`).
- Basenames (`*.base.eth`) are subnames of `base.eth`; the list tools can search them on mainnet.

## Display

The `display` text record lets an owner choose how the name is shown, differing only in case
(e.g. `Nick.eth`). Show it when set; still use the normalised name in tool calls.
