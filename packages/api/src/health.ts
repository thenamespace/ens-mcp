import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export const healthGroup = HttpApiGroup.make("health").add(
  HttpApiEndpoint.get("health", "/health").addSuccess(Schema.String),
);
