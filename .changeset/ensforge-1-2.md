---
"@thenamespace/ens-mcp": minor
---

Upgrade ensforge to 1.2.0. `get_name_details` now reports names that live on an L2 namespace
(Basenames, Linea Names, Durin, …) or behind an off-chain gateway: `status` can be `external`,
`ensVersion` can be `l2`, and a new `namespace` field says where the name lives. `grant_roles` and
`revoke_roles` reject role names of the other contract (`INVALID_ROLES`), `unwrap_name` leaves the
name with its current holder by default, and write tools refuse more doomed transactions before
they are prepared.
