import { HttpApiBuilder, HttpApiScalar } from "@effect/platform";
import { Layer } from "effect";

const corsMiddleware = HttpApiBuilder.middlewareCors();
const scalarMiddleware = HttpApiScalar.layer({
  path: "/docs",
});
const openApiMiddleware = HttpApiBuilder.middlewareOpenApi({
  path: "/openapi.json",
});

export const Middlewares = Layer.mergeAll(
  corsMiddleware,
  scalarMiddleware,
  openApiMiddleware,
);
