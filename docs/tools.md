# Tools

Tools come in toolsets, enabled as a whole. A local server enables `lookup`, `lists`, `register`
and `utils` unless `--toolsets` says otherwise (`all` enables every one); the
[hosted server](../README.md#installation) adds `manage`. Fewer toolsets mean fewer tool
definitions in your assistant's context.

| Toolset    | For                                                            | Local default | Hosted |
| ---------- | -------------------------------------------------------------- | :-----------: | :----: |
| `lookup`   | Reading names and addresses on-chain                           |      yes      |  yes   |
| `lists`    | Searching and listing names, history, expiring names (indexer) |      yes      |  yes   |
| `register` | Availability, prices, registering and renewing                 |      yes      |  yes   |
| `manage`   | Records, primary names, subnames, transfers, resolvers         |               |  yes   |
| `advanced` | Wrapping, fuses, ENSv2 roles, migration, DNS names             |               |        |
| `utils`    | Offline helpers: normalising names, coin types, content hashes |      yes      |  yes   |

Record values (text records, descriptions, avatars) are set by each name's owner. The server
strips characters that hide or reorder text and cuts very long values, and tells the assistant to
treat them as data, never as instructions.

## `lookup`

| Tool               | Answers                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `resolve_name`     | The address of up to 50 names, for ETH or any other coin                    |
| `get_primary_name` | The verified primary name of up to 50 addresses, on mainnet or an L2        |
| `get_profile`      | A name's common text records, addresses, content hash and avatar URL        |
| `get_records`      | Exactly the records asked for: texts, coins, content hash, ABI, key, data   |
| `get_name_details` | Status, owner, manager, resolver, expiry and grace period; fuses, migration |
| `get_permissions`  | What one account may do with a name, its burned fuses and ENSv2 roles       |

## `lists`

These read from an indexer ([bigname](https://bigname.sh), with goldsky as a fallback on mainnet),
which can lag the chain by a few blocks. Results come in pages: pass `cursor` back for the next
one. Set `namespace` to `basenames` for `*.base.eth` names.

| Tool                     | Answers                                                               |
| ------------------------ | --------------------------------------------------------------------- |
| `search_names`           | Names whose labels start with, or contain, some text                  |
| `list_names_for_address` | Names an address owns, manages, holds roles on, or that resolve to it |
| `list_subnames`          | The direct subnames of a name                                         |
| `get_name_history`       | Registrations, renewals, transfers, record changes, with summaries    |
| `list_expiring_names`    | Names expiring soon, overall, under a parent or for one address       |
| `get_indexer_status`     | Whether the indexer is ready and how far it lags the chain            |

## `register` and `manage`

These prepare transactions for your own wallet and never send anything; see
[Transactions](transactions.md).

| Tool                 | Answers or prepares                                                  |
| -------------------- | -------------------------------------------------------------------- |
| `check_availability` | Whether up to 50 names can be registered, with prices                |
| `get_price`          | Registration or renewal price of names for a duration                |
| `register_name`      | Registering names, with records and the primary name                 |
| `renew_names`        | Renewing names                                                       |
| `set_records`        | Setting or deleting text records, addresses and the content hash     |
| `set_primary_name`   | Setting an account's primary name, on mainnet or an L2               |
| `create_subname`     | Creating a subname with its owner, records, resolver and permissions |
| `update_subname`     | Changing a subname's owner, resolver or expiry                       |
| `remove_subname`     | Removing a subname                                                   |
| `transfer_name`      | Transferring a name                                                  |
| `set_resolver`       | Changing a name's resolver                                           |

Every toolset that prepares transactions also brings the plan tools:

| Tool              | Answers                                                              |
| ----------------- | -------------------------------------------------------------------- |
| `get_plan`        | A prepared plan read back from its handle, optionally re-checked     |
| `get_plan_status` | Where a plan the user is signing stands, from its transaction hashes |

## `advanced`

Also prepare-only. Most people never need these; enable them with `--toolsets`.

| Tool                   | Answers or prepares                                                   |
| ---------------------- | --------------------------------------------------------------------- |
| `wrap_name`            | Wrapping an ENSv1 name in the NameWrapper, optionally burning fuses   |
| `unwrap_name`          | Unwrapping a wrapped name                                             |
| `set_fuses`            | Burning NameWrapper fuses, on a name or as the parent on a subname    |
| `grant_roles`          | Granting ENSv2 roles on a name or its resolver                        |
| `revoke_roles`         | Revoking ENSv2 roles                                                  |
| `set_record_access`    | Letting an account edit some or all of an ENSv2 name's records        |
| `set_approval`         | Approving or revoking an operator, a name's delegate or a token       |
| `get_migration_status` | Whether an ENSv1 name can move to ENSv2, what blocks it, what carries |
| `migrate_name`         | Moving ENSv1 names to ENSv2, with their records and subnames          |
| `get_dns_status`       | Whether a DNS name is in ENS, and the TXT record to add               |
| `claim_dns_name`       | Claiming a DNS name into ENS with its DNSSEC proof                    |

## `utils`

These work offline.

| Tool                   | Answers                                                             |
| ---------------------- | ------------------------------------------------------------------- |
| `normalize_name`       | Normalised form (ENSIP-15), labels, namehash and labelhash of names |
| `convert_coin_type`    | A coin's symbol, coin type and EVM chain ID                         |
| `convert_content_hash` | A content hash URI, its encoded record value and a gateway URL      |

## Resources

Clients that support resources can attach these as context. Name resources come with `lookup`;
subnames, history and an address's names need `lists`. `{name}` completes from the indexer.

| URI                          | Content                                                           |
| ---------------------------- | ----------------------------------------------------------------- |
| `ens://name/{name}`          | A name's profile, as `get_profile`                                |
| `ens://name/{name}/details`  | A name's state, as `get_name_details`                             |
| `ens://name/{name}/subnames` | The first page of a name's subnames                               |
| `ens://name/{name}/history`  | A name's latest history events                                    |
| `ens://address/{address}`    | An address's primary name, avatar and names                       |
| `ens://chain`                | The server's chain, ENS contract addresses and indexer            |
| `ens://errors`               | Every error code the tools return, with its meaning and next step |
| `ens://errors/{code}`        | One error code                                                    |
| `ens://records`              | Standard text record keys, common coin types, content hash types  |

## Prompts

Each prompt walks the assistant through one workflow with the tools. A prompt is offered only when
the toolsets it uses are enabled.

| Prompt                     | Workflow                                                     | Toolsets            |
| -------------------------- | ------------------------------------------------------------ | ------------------- |
| `register_a_name`          | Check a `.eth` name, explain its cost, prepare registration  | `register`          |
| `renew_expiring_names`     | Find an address's names expiring soon and renew chosen ones  | `register`, `lists` |
| `set_up_profile`           | Review a name's profile and prepare the missing records      | `manage`            |
| `create_subnames_for_team` | Give each member a subname pointing at their address         | `manage`            |
| `migrate_to_ensv2`         | Check whether a name can move to ENSv2 and prepare it        | `advanced`          |
| `audit_name`               | Review who controls a name: expiry, control, resolver, fuses | `lookup`            |
| `portfolio_review`         | Review an address's names and recommend renewals and fixes   | `lookup`, `lists`   |
| `explain_ens_error`        | Explain an error code and how to fix it                      | any                 |

## The `ens` skill

The server serves an [Agent Skill](https://agentskills.io) at `skill://ens/SKILL.md`: how ENS works
(names, records, ownership, registration, prepared transactions, safety) and which tool fits which
task. Clients without skill support can read the same files as resources. Its source is
[`skills/ens`](../skills/ens), which you can also install into an agent directly.
