import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { PaymentToken } from "../../../schemas/Amount.js";
import { Duration } from "../../../schemas/Duration.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares moving ENSv1 names to ENSv2. */
export const MigrateName = Tool.make("migrate_name", {
  description:
    "Prepare moving ENSv1 .eth names to ENSv2 for the user to sign in their own wallet, e.g. " +
    "'Migrate alice.eth to ENSv2'. Nothing is sent. Migration is one-way. Records and subnames " +
    "the indexer finds are carried over. Check first with get_migration_status, which explains " +
    "blockers and what happens to the resolver.",
  parameters: Schema.Struct({
    names: Schema.Array(Name)
      .check(Schema.isMinLength(1), Schema.isMaxLength(20))
      .annotate({ description: "1 to 20 names to migrate together" }),
    account: Account,
    resolver: Schema.optionalKey(
      Schema.Union([Schema.Literals(["new", "shared", "keep"]), Address]),
    ).annotate({
      description:
        "new (default): a new ENSv2 resolver per name, records copied; shared: the account's " +
        "shared resolver, as the ENS app uses; keep: the current resolver; or a resolver address",
    }),
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "ENSv2 owner. Default: each name's current holder",
    }),
    preserveManager: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Give an unwrapped name's ENSv1 manager the roles to keep editing it",
    }),
    renew: Schema.optionalKey(Duration).annotate({
      description: "Renew names in their grace period first, for this long",
    }),
    paymentToken: Schema.optionalKey(PaymentToken),
    allowLeavingSubnames: Schema.optionalKey(Schema.Boolean).annotate({
      description: "Migrate even when some subnames cannot be recreated",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare an ENSv2 migration")
  .annotateMerge(ReadsEns);
