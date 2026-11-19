# Transactions

ens-mcp never signs or sends a transaction, and holds no keys. When you ask your assistant to
register a name, set records or make any other change, the server prepares it for **your own
wallet**: it plans the transactions, simulates them against the chain as your account, and hands
back everything you need to sign them yourself.

## What a prepared change contains

Every tool that prepares a change (`register_name`, `set_records`, `transfer_name` and the rest)
returns:

| Field                   | What it tells you                                                         |
| ----------------------- | ------------------------------------------------------------------------- |
| `summary`               | What the change does, in one line                                         |
| `willSucceed`, `issues` | Whether the steps that can be checked now would succeed, and if not, why  |
| `requirements`          | What your account needs first, such as a USDC balance or a token approval |
| `cost`                  | ETH sent and estimated gas                                                |
| `steps`, `signing`      | The transactions grouped by signature, the waits between them, in words   |
| `calls`                 | The unsigned calls (`to`, `data`, `value`, `chainId`) for your wallet     |
| `plan`                  | A handle (`ensplan1.…`) that carries the whole plan, to follow it later   |

If `willSucceed` is false, don't sign: the issues explain what to fix (the wrong account, a missing
balance, a permission the account lacks), each with a hint.

`account` and other address parameters accept ENS names. The result shows the address a name
resolved to; check it before you sign.

## Signing

Give the calls to your wallet in order: paste them into a wallet that accepts raw transactions,
hand them to a script or an agent wallet you control, or sign them in a Safe. The `signing` text
says which calls belong together and when to send each one.

## Registering a `.eth` name

Registration takes two signatures, at least a minute apart, so nobody can see the name you want
and register it first:

1. **Commit,** with the token approval: a hash of the registration that does not reveal the name.
2. **Wait** at least 61 seconds after the commit confirms.
3. **Register,** within 24 hours of the commit: this reveals the name and pays for it.

Registrations and renewals are paid in **USDC** by default, or **DAI**. Durations read like
`1 year`, `6 months` or `90 days`; the shortest registration is 28 days.

## Following a plan

After you send a transaction, give your assistant its hash. It calls `get_plan_status` with the
plan handle and the hashes so far, and reports:

- each step: `confirmed`, `pending`, `reverted`, `waiting`, `ready` or `blocked`;
- for a registration, how long the commitment has left;
- whether the next step would succeed if you signed it now;
- what to do next, and once every step is confirmed, which tool shows the result.

A reverted step is re-checked to explain why it failed. `get_plan` shows a plan again from its
handle, and with `check` re-simulates it against the chain as it is now.

## Plan handles

A plan handle is the plan itself, compressed: the server keeps nothing, so any instance can read
it. Handles are not signed. One that came from somewhere other than this server's tools may
describe itself misleadingly; what you would sign is its calls, so check those.
