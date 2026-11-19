---
"@thenamespace/ens-mcp": minor
---

Rewrite of the ENS MCP server, built on ensforge. The `ens-mcp` binary serves MCP over stdio by
default or over Streamable HTTP with `--http`, and speaks MCP 2026-07-28 and 2025-11-25. It reads
ENS on mainnet or Sepolia, chosen at startup, through a configurable RPC. Toolsets choose which
tools are offered: `lookup` resolves names, primary names, profiles, records, name details and
permissions; `lists` searches names, lists them by address, parent and expiry, and reads name
history from an indexer (with Basenames on mainnet); `register` and `manage` prepare registrations,
renewals, record, primary name, subname, transfer and resolver changes for the user's own wallet,
with simulation, cost and unsigned calls, and follow a plan from its transaction hashes as the user
signs it; `advanced` covers wrapping, fuses, ENSv2 roles, record access, approvals, migration to
ENSv2 and DNS names; `utils` normalises names and converts coin types and content hashes. Resources
expose names, addresses, the chain's contracts, error codes and record keys as context; prompts walk
through registration, profiles, renewals, team subnames, migration, audits and portfolio reviews;
and the `ens` Agent Skill is served at `skill://ens/SKILL.md`. Over HTTP, `--rate-limit` caps
requests per client IP (with `--proxy-hops` behind proxies), `--allowed-origins '*'` admits any
browser origin with CORS, and `GET /` and the server card at `/.well-known/mcp.json` describe the
server. The hosted server runs at `https://ens-mcp.namespace.ninja/mcp`. The server never signs or
sends transactions.
