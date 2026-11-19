# ens-mcp documentation

ens-mcp is a [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI
assistants access to ENS, the Ethereum Name Service. Start with the
[README](../README.md) to connect a client; these pages go deeper.

| Page                            | Read it to                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| [Tools](tools.md)               | See every toolset and tool, the resources, the prompts and the `ens` skill         |
| [Transactions](transactions.md) | Understand how the server prepares registrations and changes for your own wallet   |
| [Self-hosting](self-hosting.md) | Run the server yourself: configuration, HTTP, Docker, and what the hosted one sees |

## In short

- **Read anything about a name:** addresses, profiles, records, owner and manager, expiry,
  permissions, history, subnames, and the names an address holds.
- **Prepare, never send:** registrations, renewals, records, primary names, subnames, transfers and
  more come back as unsigned transactions, already simulated, with plain signing instructions.
  The server holds no keys.
- **Mainnet or Sepolia,** one per server, with Basenames (`*.base.eth`) in the list tools on
  mainnet.
- **Hosted or local:** use `https://ens-mcp.namespace.ninja/mcp`, or run
  `npx -y @thenamespace/ens-mcp`.
