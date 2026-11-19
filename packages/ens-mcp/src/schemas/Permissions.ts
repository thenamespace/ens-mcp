import { Record as Rec, Schema } from "effect";

import { Fuse, Role } from "@ensforge/sdk/effect";

/** A NameWrapper fuse of a wrapped ENSv1 name, e.g. `cannotUnwrap`. Burned fuses are permanent. */
export const FuseName = Schema.Literals(Rec.keys(Fuse.decode(0))).annotate({
  description: "NameWrapper fuse, e.g. cannotUnwrap, cannotTransfer, parentCannotControl",
});

/** An ENSv2 registry role, e.g. `setResolver` or `canTransfer`. */
export const RegistryRole = Schema.Literals(Rec.keys(Role.registry)).annotate({
  description: "ENSv2 registry role, e.g. setResolver, setSubregistry, canTransfer, renew",
});

/** An ENSv2 PermissionedResolver role, e.g. `setText` or `setAddr`. */
export const ResolverRole = Schema.Literals(Rec.keys(Role.resolver)).annotate({
  description: "ENSv2 resolver role, e.g. setText, setAddr, setContenthash",
});

/** Which ENSv2 contract's roles to change: the name's registry or its PermissionedResolver. */
export const RoleTarget = Schema.Literals(["registry", "resolver"]).annotate({
  description:
    "registry (default): roles on the name, e.g. setResolver, canTransfer, renew; resolver: roles " +
    "on every name of its PermissionedResolver, e.g. setText. For one name's records use " +
    "set_record_access",
});

/** Role names of either contract; an `…Admin` role lets its holder grant the role. */
export const RoleNames = Schema.Array(Schema.Union([RegistryRole, ResolverRole]))
  .check(Schema.isMinLength(1))
  .annotate({ description: "Role names; an Admin role lets its holder grant the role" });
