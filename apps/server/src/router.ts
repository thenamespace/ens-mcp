import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { api } from "@repo/api";
import { Config, Layer } from "effect";

import { HealthLive } from "@/routes/health";

import { Middlewares } from "./middlewares";

const RepoApiLive = HttpApiBuilder.api(api).pipe(Layer.provide(HealthLive));

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  // Middlewares
  Layer.provide(Middlewares),
  // Log the server's listening address
  HttpServer.withLogAddress,
  // Set up the Node.js HTTP server
  Layer.provide(
    BunHttpServer.layerConfig(
      Config.all({
        port: Config.number("PORT").pipe(Config.withDefault(8080)),
      }),
    ),
  ),
  // Provide API Implementation
  Layer.provide(RepoApiLive),
);
