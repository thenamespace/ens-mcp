# `@thenamespace/ens-mcp`

A [Model Context Protocol](https://modelcontextprotocol.io) server for ENS (Ethereum Name Service).

Version 0.1.0 is in development.

## Run

```sh
npx -y @thenamespace/ens-mcp               # stdio, for local MCP clients
npx -y @thenamespace/ens-mcp --http        # Streamable HTTP at http://127.0.0.1:8080/mcp
```

| Flag                | Environment variable      | Default      |
| ------------------- | ------------------------- | ------------ |
| `--http`            |                           | stdio        |
| `--host`            | `HOST`                    | `127.0.0.1`  |
| `--port`            | `PORT`                    | `8080`       |
| `--allowed-origins` | `ENS_MCP_ALLOWED_ORIGINS` | none         |
| `--chain`           | `ENS_MCP_CHAIN`           | `mainnet`    |
| `--mainnet-rpc-url` | `ENS_MCP_MAINNET_RPC_URL` | a public RPC |
| `--sepolia-rpc-url` | `ENS_MCP_SEPOLIA_RPC_URL` | a public RPC |
| `--require-rpc`     | `ENS_MCP_REQUIRE_RPC`     | `false`      |
| `--indexer`         | `ENS_MCP_INDEXER`         | `bigname`    |

- `--allowed-origins` takes a comma-separated list of browser origins allowed to call `/mcp`.
  Clients that send no `Origin` header, such as desktop and command-line clients, are always
  allowed.
- `--chain` is the chain the server reads ENS from: `mainnet` or `sepolia`. Run a second server
  for the other chain.
- Public RPCs are rate limited; set an RPC URL for regular use. `--require-rpc` makes the server
  refuse to start without one.
- `--indexer` reads name lists and history from [bigname](https://bigname.sh); on mainnet,
  goldsky answers when bigname cannot, including every Basenames query. `none` turns off the
  tools that list and search names.
- `--toolsets` takes a comma-separated list of toolsets to enable, or `all`.

## Tools

Record values (text records, descriptions, avatars) are set by each name's owner; the server strips
characters that hide or reorder text and cuts very long values.

### `lookup`

| Tool               | Answers                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `resolve_name`     | The address of up to 50 names, for ETH or any other coin                    |
| `get_primary_name` | The verified primary name of up to 50 addresses, on mainnet or an L2        |
| `get_profile`      | A name's common text records, addresses, content hash and avatar URL        |
| `get_records`      | Exactly the records asked for: texts, coins, content hash, ABI, key, data   |
| `get_name_details` | Status, owner, manager, resolver, expiry and grace period; fuses, migration |
| `get_permissions`  | What one account may do with a name, its burned fuses and ENSv2 roles       |

### `lists`

These read from the indexer, which can lag the chain by a few blocks. Results come in pages: pass
`cursor` back for the next one. Set `namespace` to `basenames` for `*.base.eth` names.

| Tool                     | Answers                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `search_names`           | Names whose labels start with, or contain, some text                  |
| `list_names_for_address` | Names an address owns, manages, holds roles on, or that resolve to it |
| `list_subnames`          | The direct subnames of a name                                         |
| `get_name_history`       | Registrations, renewals, transfers, record changes, with summaries    |
| `list_expiring_names`    | Names expiring soon, overall, under a parent or for one address       |
| `get_indexer_status`     | Whether the indexer is ready and how far it lags the chain            |

### `register` and `manage`

Write tools prepare transactions for the user's own wallet; the server never signs or sends
anything. Each returns a summary, whether the checked steps would succeed (and why not), what the
account needs (such as a USDC balance), the cost, plain signing instructions, the unsigned calls and
a plan handle. After the user signs, `get_plan_status` follows the plan from the transaction hashes:
each step's state, the registration commitment's window, whether the next step would succeed now,
and what to do next. Registrations and renewals are paid in USDC by default, or DAI;
registering takes two signatures at least a minute apart.

| Tool                 | Answers or prepares                                                  |
| -------------------- | -------------------------------------------------------------------- |
| `check_availability` | Whether up to 50 names can be registered, with prices                |
| `get_price`          | Registration or renewal price of names for a duration                |
| `register_name`      | Registering names, with records and the primary name                 |
| `renew_names`        | Renewing names                                                       |
| `set_records`        | Setting or deleting text records, addresses and the content hash     |
| `set_primary_name`   | Setting an account's primary name, on mainnet or an L2               |
| `create_subname`     | Creating a subname with its owner, records, resolver and permissions |
| `update_subname`     | Changing a subname's owner, resolver or expiry                       |
| `remove_subname`     | Removing a subname                                                   |
| `transfer_name`      | Transferring a name                                                  |
| `set_resolver`       | Changing a name's resolver                                           |
| `get_plan`           | Reading a prepared plan back from its handle, optionally re-checked  |
| `get_plan_status`    | Following a plan the user is signing, from its transaction hashes    |

`register` is on by default; `manage` is enabled with `--toolsets`. The plan tools come with any
toolset that prepares writes.

### `advanced`

Enabled with `--toolsets`. Also prepare-only.

| Tool                   | Answers or prepares                                                   |
| ---------------------- | --------------------------------------------------------------------- |
| `wrap_name`            | Wrapping an ENSv1 name in the NameWrapper, optionally burning fuses   |
| `unwrap_name`          | Unwrapping a wrapped name                                             |
| `set_fuses`            | Burning NameWrapper fuses, on a name or as the parent on a subname    |
| `grant_roles`          | Granting ENSv2 roles on a name or its resolver                        |
| `revoke_roles`         | Revoking ENSv2 roles                                                  |
| `set_record_access`    | Letting an account edit some or all of an ENSv2 name's records        |
| `set_approval`         | Approving or revoking an operator, a name's delegate or a token       |
| `get_migration_status` | Whether an ENSv1 name can move to ENSv2, what blocks it, what carries |
| `migrate_name`         | Moving ENSv1 names to ENSv2, with their records and subnames          |
| `get_dns_status`       | Whether a DNS name is in ENS, and the TXT record to add               |
| `claim_dns_name`       | Claiming a DNS name into ENS with its DNSSEC proof                    |

### `utils`

These work offline.

| Tool                   | Answers                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `normalize_name`       | Normalised form (ENSIP-15), labels, namehash and labelhash of names |
| `convert_coin_type`    | A coin's symbol, coin type and EVM chain ID                         |
| `convert_content_hash` | A content hash URI, its encoded record value and a gateway URL      |

## License

Apache-2.0
