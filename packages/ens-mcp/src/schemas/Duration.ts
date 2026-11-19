import { Schema, String as Str } from "effect";

const day = 86_400n;
const week = 7n * day;
// ENS prices a year as 365 days; a month is a twelfth of that.
const year = 365n * day;
const month = year / 12n;

const pattern = /^\s*(\d+)\s*(years?|y|months?|mo|weeks?|w|days?|d)\s*$/i;

/** A registration length such as `1 year`, `6 months` or `90 days`. */
export const Duration = Schema.String.check(
  Schema.makeFilter(
    (value: string) =>
      pattern.test(value) || "Expected a length such as 1 year, 6 months, 2 weeks or 90 days",
  ),
).annotate({
  description: "Length such as 1 year, 6 months, 2 weeks or 90 days; a year is 365 days",
  examples: ["1 year", "6 months"],
});

/** The seconds a `Duration` stands for. */
export const toSeconds = (duration: string): bigint => {
  const [, count = "0", unit = "d"] = pattern.exec(duration) ?? [];
  const key = Str.toLowerCase(unit);
  if (Str.startsWith("y")(key)) return BigInt(count) * year;
  if (Str.startsWith("mo")(key)) return BigInt(count) * month;
  if (Str.startsWith("w")(key)) return BigInt(count) * week;
  return BigInt(count) * day;
};

/** A length in seconds as whole days, e.g. `365 days`. */
export const describeSeconds = (seconds: bigint): string => {
  const days = seconds / day;
  return `${days} day${days === 1n ? "" : "s"}`;
};
