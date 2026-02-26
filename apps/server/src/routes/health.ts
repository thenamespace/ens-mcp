import { HttpApiBuilder } from "@effect/platform";
import { api } from "@repo/api";
import { Effect } from "effect";

const healthHandler = () => Effect.succeed("ok");

export const HealthLive = HttpApiBuilder.group(api, "health", (handlers) =>
  handlers.handle("health", healthHandler),
);
