# @thenamespace/ens-mcp

## 0.1.1

### Patch Changes

- a071286: Upgrade ensforge to 1.2.0. `get_name_details` now reports names that live on an L2 namespace
  (Basenames, Linea Names, Durin, …) or behind an off-chain gateway: `status` can be `external`,
  `ensVersion` can be `l2`, and a new `namespace` field says where the name lives. `grant_roles` and
  `revoke_roles` reject role names of the other contract (`INVALID_ROLES`), `unwrap_name` leaves the
  name with its current holder by default, and write tools refuse more doomed transactions before
  they are prepared.
- 9f84d1d: Over HTTP, the server no longer logs a line for each request; pass `--log-level warn` to log only
  warnings and errors.

## 0.1.0

### Minor Changes

- 738cd8b: Rewrite of the ENS MCP server, built on ensforge. The `ens-mcp` binary serves MCP over stdio by
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
