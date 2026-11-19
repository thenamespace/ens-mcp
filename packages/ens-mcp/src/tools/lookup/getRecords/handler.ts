import { Array as Arr, Effect, Option, Record as Rec } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { toCoinInput } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { cleanRecordText } from "../../../ens/recordText.js";
import type { GetRecords } from "./tool.js";

const read = <A>(selected: boolean, effect: Effect.Effect<A, EnsToolError>) =>
  selected ? Effect.asSome(effect) : Effect.succeedNone;

/** Handles `get_records`. */
export const getRecords = (ens: Ens["Service"]) =>
  Effect.fn("get_records")(function* (
    params: typeof GetRecords.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetRecords.successSchema.Type, EnsToolError> {
    const { name } = params;

    // One read per kind keeps each result typed; ensforge batches them into one multicall.
    const records = yield* Effect.all(
      {
        keyed: runEns(
          Actions.record.get(ens.client, {
            name,
            texts: params.texts ?? [],
            addresses: Arr.map(params.coins ?? [], toCoinInput),
            data: params.data ?? [],
            interfaces: params.interfaces ?? [],
          }),
        ),
        contentHash: read(
          params.contentHash === true,
          runEns(Actions.record.get(ens.client, { name, contentHash: true })),
        ),
        abi: read(params.abi === true, runEns(Actions.record.get(ens.client, { name, abi: true }))),
        pubkey: read(
          params.pubkey === true,
          runEns(Actions.record.get(ens.client, { name, pubkey: true })),
        ),
      },
      { concurrency: "unbounded" },
    );
    const { keyed } = records;

    return {
      name,
      resolver: keyed.resolver,
      ...(params.texts === undefined
        ? {}
        : {
            texts: Rec.map(keyed.texts, (value) =>
              value === null ? null : cleanRecordText(value),
            ),
          }),
      ...(params.coins === undefined ? {} : { addresses: keyed.addresses }),
      ...(params.interfaces === undefined ? {} : { interfaces: keyed.interfaces }),
      ...(params.data === undefined ? {} : { data: keyed.data }),
      ...Option.match(records.contentHash, {
        onNone: () => ({}),
        onSome: ({ contentHash }) => ({
          contentHash:
            contentHash === null ? null : { protocol: contentHash.protocol, uri: contentHash.uri },
        }),
      }),
      ...Option.match(records.abi, {
        onNone: () => ({}),
        onSome: ({ abi }) => ({
          abi: abi === null ? null : { ...abi, contentType: Number(abi.contentType) },
        }),
      }),
      ...Option.match(records.pubkey, { onNone: () => ({}), onSome: ({ pubkey }) => ({ pubkey }) }),
    };
  });
