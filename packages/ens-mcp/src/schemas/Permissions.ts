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
