import { Array as Arr, DateTime, Effect, Option, Record as Rec } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { daysUntil, fromUnixSeconds } from "../../../schemas/Timestamp.js";
import { summarize } from "./summary.js";
import type { GetNameDetails } from "./tool.js";

/** Handles `get_name_details`. */
export const getNameDetails = (ens: Ens["Service"]) =>
  Effect.fn("get_name_details")(function* (
    params: typeof GetNameDetails.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetNameDetails.successSchema.Type, EnsToolError> {
    const include = params.include ?? [];
    const optional = <A>(detail: "fuses" | "migration", effect: Effect.Effect<A, EnsToolError>) =>
      Arr.contains(include, detail) ? Effect.asSome(effect) : Effect.succeedNone;

    const { state, fuses, migration } = yield* Effect.all(
      {
        state: runEns(Actions.name.get(ens.client, { name: params.name })),
        fuses: optional(
          "fuses",
          runEns(Actions.wrapper.getFuses(ens.client, { name: params.name })),
        ),
        migration: optional(
          "migration",
          runEns(Actions.migration.get(ens.client, { name: params.name })),
        ),
      },
      { concurrency: "unbounded" },
    );
    const now = yield* DateTime.now;

    const expiry =
      state.expiry === null
        ? undefined
        : {
            at: fromUnixSeconds(state.expiry),
            daysLeft: daysUntil(state.expiry, now),
          };
    const gracePeriodEnd =
      state.gracePeriodEnd === null ? undefined : fromUnixSeconds(state.gracePeriodEnd);
    const resolverAddress = state.resolver ?? state.inheritedResolver;
    const namespace =
      state.namespace?.kind === "offchain"
        ? { ...state.namespace, provider: state.namespace.provider?.name ?? null }
        : state.namespace;

    return {
      name: state.name,
      summary: summarize({
        name: state.name,
        status: state.status,
        ensVersion: state.protocol,
        namespace,
        owner: state.owner,
        wrapped: state.wrapped,
        expiry,
        gracePeriodEnd,
      }),
      status: state.status,
      ensVersion: state.protocol,
      ...(namespace === null ? {} : { namespace }),
      owner: state.owner,
      ...(state.manager === null ? {} : { manager: state.manager }),
      ...(state.registrant === null ? {} : { registrant: state.registrant }),
      resolver:
        resolverAddress === null
          ? null
          : { address: resolverAddress, inherited: state.resolver === null },
      ...(expiry === undefined ? {} : { expiry }),
      ...(gracePeriodEnd === undefined ? {} : { gracePeriodEnd }),
      wrapped: state.wrapped,
      migrated: state.migrated,
      available: state.available,
      renewable: state.renewable,
      reachable: state.reachable,
      ...Option.match(fuses, {
        onNone: () => ({}),
        onSome: (wrapped) => ({
          fuses: wrapped === null ? null : Rec.keys(Rec.filter(wrapped.burned, (burned) => burned)),
        }),
      }),
      ...Option.match(migration, {
        onNone: () => ({}),
        onSome: ({ status, route, blockers }) => ({ migration: { status, route, blockers } }),
      }),
    };
  });
