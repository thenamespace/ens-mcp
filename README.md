# ENS MCP Server

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=ens&config=eyJuYW1lIjoiZW5zIiwidHlwZSI6Imh0dHAiLCJ1cmwiOiJodHRwczovL2Vucy1tY3AubmFtZXNwYWNlLm5pbmphL21jcCJ9)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=ens&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fens-mcp.namespace.ninja%2Fmcp%22%7D)
[![npm version](https://img.shields.io/npm/v/@thenamespace/ens-mcp?style=flat-square)](https://www.npmjs.com/package/@thenamespace/ens-mcp)

Give your AI assistant native access to ENS, the Ethereum Name Service. Resolve names, read
profiles and records, see who controls a name, browse the names an address holds, check prices,
and prepare registrations and changes for your own wallet, all through natural language.

The server never signs or sends transactions: it prepares and simulates them, and you sign.

## Installation

Connect to the hosted ENS MCP server:

```
https://ens-mcp.namespace.ninja/mcp
```

<details>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http ens https://ens-mcp.namespace.ninja/mcp
```

</details>

<details>
<summary><b>Claude Desktop and claude.ai</b></summary>

Open **Settings** > **Connectors** > **Add custom connector** and enter:

```
https://ens-mcp.namespace.ninja/mcp
```

Or run the server locally: add to `claude_desktop_config.json` (macOS:
`~/Library/Application Support/Claude/`, Windows: `%APPDATA%\Claude\`):

```json
{
  "mcpServers": {
    "ens": {
      "command": "npx",
      "args": ["-y", "@thenamespace/ens-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ens": {
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>VS Code</b></summary>

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "ens": {
      "type": "http",
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Codex</b></summary>

```bash
codex mcp add ens --url https://ens-mcp.namespace.ninja/mcp
```

</details>

<details>
<summary><b>Gemini CLI</b></summary>

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "ens": {
      "httpUrl": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>OpenCode</b></summary>

Add to your `opencode.json`:

```json
{
  "mcp": {
    "ens": {
      "type": "remote",
      "url": "https://ens-mcp.namespace.ninja/mcp",
      "enabled": true
    }
  }
}
```

</details>

<details>
<summary><b>Windsurf</b></summary>

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
  "mcpServers": {
    "ens": {
      "serverUrl": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Zed</b></summary>

Add to your Zed settings:

```json
{
  "context_servers": {
    "ens": {
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Warp</b></summary>

Go to **Settings** > **MCP Servers** > **Add MCP Server** and add:

```json
{
  "ens": {
    "url": "https://ens-mcp.namespace.ninja/mcp"
  }
}
```

</details>

<details>
<summary><b>Kiro</b></summary>

Add to `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "ens": {
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Roo Code</b></summary>

Add to your Roo Code MCP config:

```json
{
  "mcpServers": {
    "ens": {
      "type": "streamable-http",
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

</details>

<details>
<summary><b>Antigravity</b></summary>

Open the MCP Store panel (from the "..." menu in the side panel), then add a custom server with:

```
https://ens-mcp.namespace.ninja/mcp
```

</details>

<details>
<summary><b>Other clients</b></summary>

For clients that support remote MCP servers:

```json
{
  "mcpServers": {
    "ens": {
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

For clients that only launch local servers:

```json
{
  "mcpServers": {
    "ens": {
      "command": "npx",
      "args": ["-y", "@thenamespace/ens-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Self-hosting</b></summary>

Run the server yourself to pick the chain, your RPC and the toolsets. It needs Node.js 26 or later.

```bash
npx -y @thenamespace/ens-mcp                         # stdio
npx -y @thenamespace/ens-mcp --http --port 8080      # http://127.0.0.1:8080/mcp
```

| Variable           | Description                                   | Default                       |
| ------------------ | --------------------------------------------- | ----------------------------- |
| `ENS_MCP_RPC_URL`  | RPC URL for the chain                         | a public RPC                  |
| `ENS_MCP_CHAIN`    | `mainnet` or `sepolia`                        | `mainnet`                     |
| `ENS_MCP_TOOLSETS` | Toolsets to enable, comma-separated, or `all` | `lookup,lists,register,utils` |

Every option, HTTP, Docker and rate limits: [docs/self-hosting.md](docs/self-hosting.md).

</details>

The hosted server reads Ethereum mainnet and allows 60 requests per minute per IP. To keep your
lookups to yourself, or to use Sepolia or the `advanced` tools, run it locally.

## 💬 Example questions

Once ENS MCP is installed, you can ask things like:

```markdown
1️⃣ Basic lookup

> Who owns vitalik.eth, and when does it expire?

2️⃣ Records and addresses

> Give me the ETH and Solana addresses and the Twitter handle for nick.eth.

3️⃣ Reverse lookup

> What is the primary name of 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?

4️⃣ Portfolio

> Which ENS names does vitalik.eth hold, and which expire in the next 90 days?

5️⃣ Subnames

> List the subnames of base.eth.

6️⃣ History

> When did vitalik.eth last change its content hash?

7️⃣ Availability and price

> Is coolname.eth available? How much is it for 2 years, and if it's taken, who owns it?

8️⃣ Registration

> Register coolname.eth for 1 year for my wallet 0x… and set it as my primary name.

9️⃣ Profile changes

> Set my avatar and Twitter handle on alice.eth. I'm signing with alice.eth.

🔟 Follow-up

> I sent the commit transaction, here's the hash. What now?
```

## Available tools

Tools come in toolsets. The hosted server has every toolset but `advanced`; locally, choose with
`ENS_MCP_TOOLSETS`.

| Toolset    | Tools                                                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `lookup`   | `resolve_name`, `get_primary_name`, `get_profile`, `get_records`, `get_name_details`, `get_permissions`                                   |
| `lists`    | `search_names`, `list_names_for_address`, `list_subnames`, `get_name_history`, `list_expiring_names`, `get_indexer_status`                |
| `register` | `check_availability`, `get_price`, `register_name`, `renew_names`                                                                         |
| `manage`   | `set_records`, `set_primary_name`, `create_subname`, `update_subname`, `remove_subname`, `transfer_name`, `set_resolver`                  |
| `advanced` | `wrap_name`, `unwrap_name`, `set_fuses`, `grant_roles`, `revoke_roles`, `set_record_access`, `set_approval`, `migrate_name`, DNS names, … |
| `utils`    | `normalize_name`, `convert_coin_type`, `convert_content_hash`                                                                             |

The toolsets that prepare transactions also bring `get_plan` and `get_plan_status`. The server
offers resources (`ens://name/{name}` and more), workflow prompts and an `ens` agent skill too.

## Documentation

- [Tools](docs/tools.md): every tool, resource, prompt and the skill
- [Transactions](docs/transactions.md): how changes are prepared, signed and followed
- [Self-hosting](docs/self-hosting.md): configuration, HTTP, Docker, the hosted server

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) to set up the repository, and
[SECURITY.md](SECURITY.md) to report a vulnerability.

---

Built with ❤️ by [Namespace](https://namespace.ninja/) Ninjas 🥷
