import { Duration, Option } from "effect";

export const parseDuration = (
  duration: string,
  defaultDuration?: Duration.DurationInput,
) => {
  let safeDuration = duration;

  if (duration.includes("year")) {
    const [amount] = duration.split("") as [string, string];
    safeDuration = `${Number(amount) * 356} days`;
  }

  if (duration.includes("month")) {
    const [amount] = duration.split("") as [string, string];
    safeDuration = `${Number(amount) * 30} days`;
  }

  const decoded = Duration.decodeUnknown(safeDuration);

  if (Option.isSome(decoded)) {
    return decoded.value;
  }

  return Duration.decode(defaultDuration ?? "356 days");
};
