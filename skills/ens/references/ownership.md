# Ownership and permissions

Who controls a name depends on which version of ENS it lives on. `get_name_details` shows the
version, owner, manager and registrant; `get_permissions` shows what one account may do.

## ENSv1

- **Registrant**: holds the `.eth` registration, an ERC-721 token on the BaseRegistrar. It can
  transfer the registration and reclaim management.
- **Manager**: the owner in the ENS registry. It sets the resolver and records and creates
  subnames. Usually the same address as the registrant.
- **Wrapped names**: the NameWrapper turns a name into an ERC-1155 token with one owner, replacing
  the registrant/manager split, and enables **fuses**.

### Fuses

Fuses are permissions burned into a wrapped name; once burned they cannot be restored, not even by
the owner, until the name expires.

- Owner-controlled fuses, such as `cannotUnwrap`, `cannotTransfer`, `cannotSetResolver`,
  `cannotCreateSubdomain`, `cannotApprove`. Burning any of them also burns or requires
  `cannotUnwrap`, and the name must be emancipated first; a wrapped `.eth` second-level name is.
- Parent-controlled fuses, burned by the parent's owner on a subname: `parentCannotControl`
  (the parent gives up control: the subname is **emancipated**) and `canExtendExpiry`.
- A name with `cannotUnwrap` burned is **locked**.

## ENSv2

ENSv2 gives every name level its own **registry** and replaces the manager/fuse model with
**roles**: permissions granted to accounts per name, such as `setResolver`, `setSubregistry`,
`canTransfer` and `renew`. Each role has an `…Admin` counterpart that lets its holder grant and
revoke it.

- The owner holds the roles the registry gave it; `grant_roles` and `revoke_roles` share them.
- A name's subnames live in its **subregistry** (`create_subname` deploys one when needed).
- Names use a **PermissionedResolver**, whose record roles (`setText`, `setAddr`, …) can be granted
  for one name's records with `set_record_access`.
- ENSv1 names keep working; `get_migration_status` explains whether and how one can move to ENSv2,
  and `migrate_name` prepares the move, which is one-way.

## Approvals

- **Operator**: may manage every name an account holds on one contract (`set_approval` kind
  `operator`). Full control; use with care.
- **Delegate**: may manage one name's records.
- **Token approval**: may move one name's token (ERC-721 or ERC-1155).
