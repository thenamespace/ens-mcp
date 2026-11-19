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
- `--indexer none` turns off the tools that list and search names.
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

### `utils`

These work offline.

| Tool                   | Answers                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `normalize_name`       | Normalised form (ENSIP-15), labels, namehash and labelhash of names |
| `convert_coin_type`    | A coin's symbol, coin type and EVM chain ID                         |
| `convert_content_hash` | A content hash URI, its encoded record value and a gateway URL      |

## License

Apache-2.0
