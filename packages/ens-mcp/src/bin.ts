#!/usr/bin/env node
import { NodeRuntime, NodeServices } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { Command } from "effect/cli";

import { cli } from "./cli.js";
import { PackageInfo } from "./PackageInfo.js";

Effect.gen(function* () {
  const { version } = yield* PackageInfo;
  yield* Command.run(cli, { version });
}).pipe(
  Effect.provide(PackageInfo.layer.pipe(Layer.provideMerge(NodeServices.layer))),
  NodeRuntime.runMain,
);
