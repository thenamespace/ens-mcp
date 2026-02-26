import "dotenv/config";

import { BunRuntime } from "@effect/platform-bun";
import { DatabaseLive } from "@repo/database";
import { Layer } from "effect";

import { EnvLive } from "./env";
import { HttpLive } from "./router";

const app = HttpLive.pipe(
  Layer.provideMerge(DatabaseLive),
  Layer.provideMerge(EnvLive),
);

BunRuntime.runMain(Layer.launch(app));
