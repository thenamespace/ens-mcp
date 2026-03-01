/** biome-ignore-all lint/suspicious/noExplicitAny: safe */
import { Duration } from "effect";

export const parseDuration = (
  duration: string,
  defaultDuration?: Duration.Input,
) => {
  let safeDuration = duration;

  if (duration.includes("year")) {
    const [amount] = duration.split(" ") as [string, string];
    safeDuration = `${Number(amount) * 365} days`;
  }

  if (duration.includes("month")) {
    const [amount] = duration.split(" ") as [string, string];
    safeDuration = `${Number(amount) * 30} days`;
  }

  return (
    Duration.fromInput(safeDuration as any) ??
    Duration.fromInputUnsafe(defaultDuration ?? "365 days")
  );
};
