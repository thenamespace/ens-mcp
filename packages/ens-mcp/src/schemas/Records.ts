import { Array as Arr, Record as Rec, Schema } from "effect";

/** Records to write: each key's new value, or `null` to delete it. */
export const RecordChanges = Schema.Struct({
  texts: Schema.optionalKey(Schema.Record(Schema.String, Schema.NullOr(Schema.String))).annotate({
    description:
      "Text records by key, e.g. { url: 'https://…', 'com.github': 'alice' }; null deletes",
  }),
  addresses: Schema.optionalKey(
    Schema.Record(Schema.String, Schema.NullOr(Schema.String)),
  ).annotate({
    description: "Addresses by coin, e.g. { eth: '0x…', btc: 'bc1…' }; null deletes",
  }),
  contentHash: Schema.optionalKey(Schema.NullOr(Schema.String)).annotate({
    description: "Content hash URI, e.g. ipfs://…; null deletes",
  }),
});

/** Whether `changes` writes anything. */
export const hasChanges = (changes: typeof RecordChanges.Type) =>
  Arr.some(
    [changes.texts, changes.addresses],
    (keyed) => keyed !== undefined && !Rec.isEmptyRecord(keyed),
  ) || changes.contentHash !== undefined;

/** `changes` as ensforge's record options. */
export const toRecordOptions = (changes: typeof RecordChanges.Type) => ({
  ...(changes.texts === undefined ? {} : { texts: changes.texts }),
  ...(changes.addresses === undefined ? {} : { addresses: changes.addresses }),
  ...(changes.contentHash === undefined ? {} : { contentHash: changes.contentHash }),
});
