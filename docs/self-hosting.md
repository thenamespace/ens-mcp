# Self-hosting

Run the server yourself to choose the chain, the RPC and the toolsets. It needs Node.js 26 or later.

```sh
npx -y @thenamespace/ens-mcp               # stdio, for local MCP clients
npx -y @thenamespace/ens-mcp --http        # Streamable HTTP at http://127.0.0.1:8080/mcp
```

For a local client, point it at the command. Claude Code, for example:

```sh
claude mcp add ens -e ENS_MCP_RPC_URL=https://your-rpc.example -- npx -y @thenamespace/ens-mcp
```

## Configuration

Every flag has an environment variable; a flag wins over its variable.

| Flag                | Environment variable      | Default                       |
| ------------------- | ------------------------- | ----------------------------- |
| `--chain`           | `ENS_MCP_CHAIN`           | `mainnet`                     |
| `--rpc-url`         | `ENS_MCP_RPC_URL`         | a public RPC                  |
| `--require-rpc`     | `ENS_MCP_REQUIRE_RPC`     | `false`                       |
| `--indexer`         | `ENS_MCP_INDEXER`         | `bigname`                     |
| `--toolsets`        | `ENS_MCP_TOOLSETS`        | `lookup,lists,register,utils` |
| `--http`            |                           | stdio                         |
| `--host`            | `HOST`                    | `127.0.0.1`                   |
| `--port`            | `PORT`                    | `8080`                        |
| `--allowed-origins` | `ENS_MCP_ALLOWED_ORIGINS` | none                          |
| `--rate-limit`      | `ENS_MCP_RATE_LIMIT`      | unlimited                     |
| `--proxy-hops`      | `ENS_MCP_PROXY_HOPS`      | `0`                           |

- **`--chain`**: `mainnet` or `sepolia`. One server reads one chain; run a second for the other.
- **`--rpc-url`**: the RPC for that chain. Public RPCs are rate limited, so set your own for
  regular use; `--require-rpc` refuses to start without one.
- **`--indexer`**: `bigname` reads name lists and history from [bigname](https://bigname.sh), with
  goldsky answering when bigname cannot on mainnet (including every Basenames query). `none` turns
  off the `lists` tools.
- **`--toolsets`**: a comma-separated list, or `all`. See [Tools](tools.md).

## Over HTTP

With `--http` the server serves MCP over Streamable HTTP at `/mcp`, for clients that speak MCP
2026-07-28 or 2025-11-25. It also answers:

- `GET /`: a short page on how to connect;
- `GET /.well-known/mcp.json`: a server card describing the server, its endpoint and toolsets;
- `GET /healthz`: `ok`, for load balancers and container probes.

Request bodies are capped at 256 KiB.

**Browsers.** Clients that send no `Origin` header, such as desktop and command-line apps, are
always allowed. Browser origins must be listed in `--allowed-origins`, or `*` allows any; the
server answers their CORS requests. Leave it empty for a server on your own machine: it stops web
pages you visit from calling it.

**Rate limits.** `--rate-limit 60/min` (`s`, `min` or `h`) caps the requests each client IP sends
to `/mcp`, counting IPv6 clients per /64. Over the limit the server answers 429 with
`Retry-After`. Opening a session (an MCP 2025-11-25 `initialize`) costs ten requests, because the
session stays in memory. Each server process counts on its own.

**Behind a proxy.** Set `--proxy-hops` to the number of `X-Forwarded-For` entries your proxies
append, so limits count per client rather than per proxy: `1` behind one reverse proxy such as
Traefik or nginx, `2` with a load balancer in front of it. Entries the client sent itself are never trusted.

## Docker

The repository's [`Dockerfile`](../Dockerfile) builds the hosted server: its command sets the
hosted configuration (the `manage` toolset added, the Namespace RPC, any origin, 60 requests per
minute and one proxy hop). Override the command to run it your way:

```sh
docker build -t ens-mcp .
docker run -p 8080:8080 ens-mcp node dist/bin.js --http --rpc-url https://your-rpc.example
```

## The hosted server

`https://ens-mcp.namespace.ninja/mcp` runs that image on Google Kubernetes Engine behind Traefik, reading mainnet through
the Namespace RPC with the `lookup`, `lists`, `register`, `manage` and `utils` toolsets.

- **What it sees:** the requests your assistant sends, which include the names and addresses you
  ask about.
- **What it keeps:** a log line per HTTP request (method, path, status) and the ingress's access
  logs, which include your IP address. Tool arguments and results are not logged.
- **Limits:** 60 requests per minute per IP.

To keep your lookups to yourself, run the server locally with your own RPC.

## Troubleshooting

- **Rate limited, timeouts:** public RPCs throttle. Set `--rpc-url`.
- **A list misses a recent change:** the indexer can lag the chain by a few blocks;
  `get_indexer_status` shows by how much.
- **Your client shows too many tools:** enable fewer toolsets. Some clients cap the number of
  tools they load.
- **A client loses its session:** with MCP 2025-11-25, a server restart forgets sessions; the
  client gets 404 and connects again.
