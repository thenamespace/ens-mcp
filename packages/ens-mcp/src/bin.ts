#!/usr/bin/env node
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Console, Effect, Layer, Logger } from "effect";
import { Command } from "effect/cli";

import { cli } from "./cli.js";
import { PackageInfo } from "./PackageInfo.js";

Effect.gen(function* () {
  const { version } = yield* PackageInfo;
  yield* Command.run(cli, { version });
}).pipe(
  // Configuration problems are expected outcomes: one line on stderr and exit code 1.
  Effect.catchTag("StartupError", ({ message }) =>
    Console.error(message).pipe(Effect.andThen(Effect.sync(() => (process.exitCode = 1)))),
  ),
  Effect.provide(
    PackageInfo.layer.pipe(
      Layer.provideMerge(NodeServices.layer),
      // On stdio, stdout carries JSON-RPC only; a log line there would break the client.
      Layer.provideMerge(Layer.succeed(Logger.LogToStderr, true)),
    ),
  ),
  NodeRuntime.runMain,
);
