import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { Timestamp } from "../../../schemas/Timestamp.js";
import { ReadsEns } from "../../annotations.js";

/** Explains whether and how an ENSv1 name can move to ENSv2. */
export const GetMigrationStatus = Tool.make("get_migration_status", {
  description:
    "Check whether an ENSv1 name can move to ENSv2 and what would happen, e.g. 'Can I migrate " +
    "alice.eth?'. Returns the status (eligible, blocked, migrated, not-required), the route, " +
    "what blocks it in plain words, what happens to its resolver and records, the roles and " +
    "expiry it gets on ENSv2, and the records and subnames that carry over. Then prepare it with " +
    "migrate_name.",
  parameters: Schema.Struct({
    name: Name,
    account: Schema.optionalKey(AddressOrName).annotate({
      description: "Account that would migrate. Default: the name's holder",
    }),
  }),
  success: Schema.Struct({
    name: Name,
    status: Schema.Literals(["eligible", "blocked", "migrated", "not-required"]),
    route: Schema.NullOr(
      Schema.Literals(["unwrapped", "wrapped-unlocked", "wrapped-locked", "locked-child"]),
    ),
    blockers: Schema.Array(Schema.Struct({ code: Schema.String, meaning: Schema.String })),
    owner: Schema.NullOr(Address).annotate({ description: "Holder of the token that moves" }),
    manager: Schema.optionalKey(Address).annotate({
      description: "ENSv1 manager, when it differs from the registrant",
    }),
    burnedFuses: Schema.optionalKey(Schema.Array(Schema.String)),
    expiry: Schema.optionalKey(Timestamp),
    resolver: Schema.optionalKey(
      Schema.Struct({
        current: Schema.NullOr(Address),
        plan: Schema.String.annotate({ description: "What migrating does with the resolver" }),
      }),
    ),
    after: Schema.optionalKey(
      Schema.Struct({
        registry: Schema.NullOr(Address),
        subregistry: Schema.NullOr(Schema.Literals(["wrapper-registry", "user-registry"])),
        expiry: Schema.optionalKey(Timestamp),
        roles: Schema.Array(Schema.String).annotate({ description: "Roles the owner gets" }),
      }),
    ).annotate({ description: "The name on ENSv2 after migrating, while it can still migrate" }),
    carriesOver: Schema.optionalKey(
      Schema.Struct({
        records: Schema.optionalKey(
          Schema.Struct({
            keys: Schema.Array(Schema.String),
            skipped: Schema.Array(Schema.String),
            complete: Schema.Boolean,
          }),
        ),
        subnames: Schema.optionalKey(Schema.Array(Schema.String)),
      }),
    ).annotate({ description: "Records and subnames the indexer found to carry over" }),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Check ENSv2 migration")
  .annotateMerge(ReadsEns);
