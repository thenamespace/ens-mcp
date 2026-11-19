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
- `--chain` is the chain tools read when a call does not name one: `mainnet` or `sepolia`.
- Public RPCs are rate limited; set an RPC URL for regular use. `--require-rpc` makes the server
  refuse to start without one for every chain.
- `--indexer none` turns off the tools that list and search names.

## Tools

| Tool           | Does                                                                 |
| -------------- | -------------------------------------------------------------------- |
| `resolve_name` | Resolves up to 50 ENS names to addresses, for ETH or any other coin. |

## License

Apache-2.0
