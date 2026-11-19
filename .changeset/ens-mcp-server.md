---
"@thenamespace/ens-mcp": minor
---

Rewrite of the ENS MCP server, built on ensforge. The `ens-mcp` binary serves MCP over stdio by
default or over Streamable HTTP with `--http`, and speaks MCP 2026-07-28 and 2025-11-25. It reads
ENS on mainnet and Sepolia through configurable RPCs. First tool: `resolve_name`.
