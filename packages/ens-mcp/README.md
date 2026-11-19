# `@thenamespace/ens-mcp`

A [Model Context Protocol](https://modelcontextprotocol.io) server for ENS (Ethereum Name Service).

Version 0.1.0 is in development.

## Run

```sh
npx -y @thenamespace/ens-mcp               # stdio, for local MCP clients
npx -y @thenamespace/ens-mcp --http        # Streamable HTTP at http://127.0.0.1:8080/mcp
```

| Flag                | Environment variable      | Default     |
| ------------------- | ------------------------- | ----------- |
| `--http`            |                           | stdio       |
| `--host`            | `HOST`                    | `127.0.0.1` |
| `--port`            | `PORT`                    | `8080`      |
| `--allowed-origins` | `ENS_MCP_ALLOWED_ORIGINS` | none        |

`--allowed-origins` takes a comma-separated list of browser origins allowed to call `/mcp`. Clients
that send no `Origin` header, such as desktop and command-line clients, are always allowed.

## License

Apache-2.0
