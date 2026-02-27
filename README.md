# ENS MCP Server

[![Install in Cursor](https://img.shields.io/badge/Install_in-Cursor-000000?style=flat-square&logoColor=white)](https://cursor.com/en/install-mcp?name=ens&config=eyJuYW1lIjoiZW5zIiwidHlwZSI6Imh0dHAiLCJ1cmwiOiJodHRwczovL2Vucy1tY3AubmFtZXNwYWNlLm5pbmphL21jcCJ9)
[![Install in VS Code](https://img.shields.io/badge/Install_in-VS_Code-0098FF?style=flat-square&logo=visualstudiocode&logoColor=white)](https://vscode.dev/redirect/mcp/install?name=ens-mcp&config=%7B%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fens-mcp.namespace.ninja%2Fmcp%22%7D)
[![npm version](https://badge.fury.io/js/ens-mcp.svg)](https://www.npmjs.com/package/ens-mcp)

Connect AI assistants to ENS (Ethereum Name Service) for name lookups, profile information, availability checks, and pricing.

## Installation

Connect to ENS MCP Server:

```
https://ens-mcp.namespace.ninja/mcp
```

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
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http ens https://ens-mcp.namespace.ninja/mcp
```
</details>

<details>
<summary><b>Claude Desktop</b></summary>

Add to your config file:
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ens": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://ens-mcp.namespace.ninja/mcp"]
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
<summary><b>Antigravity</b></summary>

Open the MCP Store panel (from the "..." dropdown in the side panel), then add a custom server with:

```
https://ens-mcp.namespace.ninja/mcp
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
<summary><b>Other Clients</b></summary>

For clients that support remote MCP:

```json
{
  "mcpServers": {
    "ens": {
      "url": "https://ens-mcp.namespace.ninja/mcp"
    }
  }
}
```

For clients that need mcp-remote:

```json
{
  "mcpServers": {
    "ens": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://ens-mcp.namespace.ninja/mcp"]
    }
  }
}
```
</details>

<details>
<summary><b>Self-Hosting</b></summary>

You can also self-host the ENS MCP Server using the npm package.

**Stdio Transport:**

```bash
npx -y ens-mcp
```

**HTTP Transport:**

```bash
npx -y ens-mcp --http --port 8080
```

The server will be available at `http://localhost:8080/mcp`.

**Environment Variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `RPC_URL` | Ethereum mainnet RPC URL | Public mainnet RPC |

Example with custom RPC:

```bash
RPC_URL=https://your-rpc-provider.com npx -y ens-mcp
```
</details>

## 💬 Example Natural Language Queries

Once ENS MCP is installed, you can ask things like:

```markdown
1️⃣ Basic Lookup

> Who owns vitalik.eth?

2️⃣ Resolver & Expiry

> What is the resolver and expiry date of vitalik.eth?

3️⃣ Records & Addresses

> Give me the ETH address and Twitter handle for vitalik.eth.

4️⃣ Reverse Lookup

> What ENS names are owned by 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?

5️⃣ Subnames

> List all subdomains under base.eth.

6️⃣ Portfolio Analysis

> Show me all ENS names owned by this address and tell me which ones are expiring soon.

7️⃣ Conditional Acquisition Strategy

> I want to get example.eth. How much does it cost for 2 years? And if it’s not available, give me the owner details and socials so I can contact them.
```

## Available Tools

| Tool | Description |
| ---- | ----------- |
| `is_name_available` | Check if an ENS name is available for registration |
| `get_name_price` | Get the price of an ENS name for a given duration |
| `get_profile_details` | Fetch detailed ENS profile information including ownership, resolver, expiry status, text records, address records, and content hash |


Built with ❤️ by Namespace 🥷