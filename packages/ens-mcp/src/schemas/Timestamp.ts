import { DateTime, Duration, Schema } from "effect";

/** A point in time as an ISO 8601 UTC string, e.g. `2027-03-01T12:00:00.000Z`. */
export const Timestamp = Schema.String.annotate({ description: "ISO 8601 date and time in UTC" });

/** Converts the Unix seconds ENS contracts store into a `Timestamp`. */
export const fromUnixSeconds = (seconds: bigint): string =>
  DateTime.formatIso(DateTime.makeUnsafe(Number(seconds) * 1000));

/** Whole days from `now` until Unix time `seconds`; negative once it has passed. */
export const daysUntil = (seconds: bigint, now: DateTime.DateTime): number =>
  Math.floor(
    Duration.toDays(Duration.millis(Number(seconds) * 1000 - DateTime.toEpochMillis(now))),
  );
