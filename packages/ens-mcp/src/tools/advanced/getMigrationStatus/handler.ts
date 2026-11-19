import { Array as Arr, Effect, Record as Rec } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { fromUnixSeconds } from "../../../schemas/Timestamp.js";
import type { GetMigrationStatus } from "./tool.js";

const blockerMeanings: Readonly<Record<string, string>> = {
  "not-eth": "Only .eth names and their subnames move to ENSv2.",
  expired: "The registration expired; renew it first (or pass renew to migrate_name in grace).",
  "not-reserved": "ENSv2 holds no reservation for this name.",
  "not-owner": "The account neither holds the name nor is an approved operator.",
  "cannot-transfer": "The cannotTransfer fuse is burned, so the token cannot move.",
  "frozen-approval": "cannotApprove is burned while a token approval is set.",
  "parent-not-migrated": "A locked subname moves only after its parent has migrated.",
  "unlocked-child": "This subname is recreated when its parent migrates, not on its own.",
  "locked-resolver": "cannotSetResolver keeps a resolver that ENSv2 could not edit.",
  "unknown-label": "Only the label's hash is known, so the name cannot be recreated.",
};

const resolverMeanings: Readonly<Record<string, string>> = {
  new: "A new ENSv2 resolver for the name, with its records copied in",
  owned: "The account's shared ENSv2 resolver, with the records copied in",
  keep: "Keeps the current resolver; records on the ENSv1 public resolver become read-only",
  address: "A resolver the caller names",
  "public-v2": "ENSv2 swaps the locked name's public resolver for PublicResolverV2",
  none: "No resolver",
};

/** Handles `get_migration_status`. */
export const getMigrationStatus = (ens: Ens["Service"]) =>
  Effect.fn("get_migration_status")(function* (
    params: typeof GetMigrationStatus.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetMigrationStatus.successSchema.Type, EnsToolError> {
    const account =
      params.account === undefined ? undefined : yield* resolveAccount(ens, params.account);

    const migration = yield* runEns(
      Actions.migration.get(ens.client, {
        name: params.name,
        ...(account === undefined ? {} : { account }),
      }),
    );
    const { discovered } = migration;

    return {
      name: migration.name,
      status: migration.status,
      route: migration.route,
      blockers: Arr.map(migration.blockers, (code) => ({
        code,
        meaning: blockerMeanings[code] ?? code,
      })),
      owner: migration.owner,
      ...(migration.manager === null ? {} : { manager: migration.manager }),
      ...(migration.fuses === null
        ? {}
        : { burnedFuses: Rec.keys(Rec.filter(migration.fuses, (burned) => burned)) }),
      ...(migration.expiry === null ? {} : { expiry: fromUnixSeconds(migration.expiry) }),
      // What migrating would do only applies to a name that has yet to move.
      ...(migration.status === "eligible" || migration.status === "blocked"
        ? {
            resolver: {
              current: migration.resolver.current,
              plan: resolverMeanings[migration.resolver.plan] ?? migration.resolver.plan,
            },
            after: {
              registry: migration.after.registry,
              subregistry: migration.after.subregistry,
              ...(migration.after.expiry === null
                ? {}
                : { expiry: fromUnixSeconds(migration.after.expiry) }),
              roles: migration.after.roles,
            },
          }
        : {}),
      ...(discovered === null
        ? {}
        : {
            carriesOver: {
              ...(discovered.records === null ? {} : { records: discovered.records }),
              ...(discovered.subnames === null ? {} : { subnames: discovered.subnames }),
            },
          }),
    };
  });
