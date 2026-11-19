---
"@thenamespace/ens-mcp": minor
---

Rewrite of the ENS MCP server, built on ensforge. The `ens-mcp` binary serves MCP over stdio by
default or over Streamable HTTP with `--http`, and speaks MCP 2026-07-28 and 2025-11-25. It reads
ENS on mainnet or Sepolia, chosen at startup, through a configurable RPC. Toolsets choose which
tools are offered: `lookup` resolves names, primary names, profiles, records, name details and
permissions; `lists` searches names, lists them by address, parent and expiry, and reads
name history from an indexer (with Basenames on mainnet); `register` and `manage` prepare
registrations, renewals, record, primary name, subname, transfer and resolver changes for the
user's own wallet, with simulation, cost and unsigned calls; `utils` normalises names and
converts coin types and content hashes. The server never signs or sends transactions.
