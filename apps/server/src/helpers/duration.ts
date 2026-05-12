/** biome-ignore-all lint/suspicious/noExplicitAny: safe */
import { Duration, Option } from "effect";

export const parseDuration = (
  duration: string,
  defaultDuration?: Duration.Input,
): Duration.Duration => {
  let safeDuration = duration;

  if (duration.includes("year")) {
    const [amount] = duration.split(" ") as [string, string];
    safeDuration = `${Number(amount) * 365} days`;
  }

  if (duration.includes("month")) {
    const [amount] = duration.split(" ") as [string, string];
    safeDuration = `${Number(amount) * 30} days`;
  }

  const safeDurationOption = Duration.fromInput(safeDuration as any);

  if (Option.isSome(safeDurationOption)) {
    return safeDurationOption.value;
  }
  return Duration.fromInputUnsafe(defaultDuration ?? "365 days");
};
