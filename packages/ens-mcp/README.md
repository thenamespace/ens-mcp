# ENS MCP Server

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=ens&config=eyJuYW1lIjoiZW5zIiwidHlwZSI6Imh0dHAiLCJ1cmwiOiJodHRwczovL2Vucy1tY3AubmFtZXNwYWNlLm5pbmphL21jcCJ9)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=ens&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fens-mcp.namespace.ninja%2Fmcp%22%7D)
[![npm version](https://img.shields.io/npm/v/@thenamespace/ens-mcp?style=flat-square)](https://www.npmjs.com/package/@thenamespace/ens-mcp)

Give your AI assistant native access to ENS, the Ethereum Name Service. Resolve names, read
profiles and records, see who controls a name, browse the names an address holds, check prices,
and prepare registrations and changes for your own wallet, all through natural language.

The server never signs or sends transactions: it prepares and simulates them, and you sign.

## Installation

Use the hosted server, no install needed:

```
https://ens-mcp.namespace.ninja/mcp
```

```bash
claude mcp add --transport http ens https://ens-mcp.namespace.ninja/mcp
```

Or run this package as a local server over stdio. It needs Node.js 26 or later:

```json
{
  "mcpServers": {
    "ens": {
      "command": "npx",
      "args": ["-y", "@thenamespace/ens-mcp"],
      "env": { "ENS_MCP_RPC_URL": "https://your-rpc.example" }
    }
  }
}
```

Setup for Cursor, VS Code, Codex, Gemini CLI, Windsurf, Zed and more is in the
[repository README](https://github.com/thenamespace/ens-mcp#installation).

| Variable           | Description                                   | Default                       |
| ------------------ | --------------------------------------------- | ----------------------------- |
| `ENS_MCP_RPC_URL`  | RPC URL for the chain                         | a public RPC                  |
| `ENS_MCP_CHAIN`    | `mainnet` or `sepolia`                        | `mainnet`                     |
| `ENS_MCP_TOOLSETS` | Toolsets to enable, comma-separated, or `all` | `lookup,lists,register,utils` |

`npx -y @thenamespace/ens-mcp --http` serves Streamable HTTP at `http://127.0.0.1:8080/mcp`. Every
flag, rate limits and Docker:
[self-hosting](https://github.com/thenamespace/ens-mcp/blob/main/docs/self-hosting.md).

## 💬 Example questions

```markdown
> Who owns vitalik.eth, and when does it expire?
> Give me the ETH address and Twitter handle for nick.eth.
> Which ENS names does vitalik.eth hold, and which expire in the next 90 days?
> Is coolname.eth available? How much is it for 2 years?
> Register coolname.eth for 1 year for my wallet and set it as my primary name.
> I sent the commit transaction, here's the hash. What now?
```

## Available tools

| Toolset    | For                                                                    | Default |
| ---------- | ---------------------------------------------------------------------- | :-----: |
| `lookup`   | Addresses, primary names, profiles, records, ownership and permissions |   yes   |
| `lists`    | Searching names, names by address, subnames, history, expiring names   |   yes   |
| `register` | Availability, prices, preparing registrations and renewals             |   yes   |
| `manage`   | Preparing records, primary names, subnames, transfers and resolvers    |         |
| `advanced` | Preparing wrapping, fuses, ENSv2 roles, migration and DNS names        |         |
| `utils`    | Offline: normalising names, coin types, content hashes                 |   yes   |

The server also offers resources, workflow prompts and an `ens` agent skill. Every tool:
[docs/tools.md](https://github.com/thenamespace/ens-mcp/blob/main/docs/tools.md). How prepared
transactions work:
[docs/transactions.md](https://github.com/thenamespace/ens-mcp/blob/main/docs/transactions.md).

## License

[Apache-2.0](https://github.com/thenamespace/ens-mcp/blob/main/LICENSE). Built with ❤️ by
[Namespace](https://namespace.ninja/) Ninjas 🥷
