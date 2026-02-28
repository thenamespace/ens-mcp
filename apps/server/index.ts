import { NodeRuntime } from "@effect/platform-node";
import { Effect } from "effect";

import { EnsLive, EnsSubgraphActions } from "@/ens";

const program = Effect.gen(function* () {
  const actions = yield* EnsSubgraphActions;

  const res = yield* actions.getSubnamesForName({
    name: "envoy1084.eth",
    pageSize: 100,
  });

  yield* Effect.log(res);
}).pipe(Effect.provide(EnsLive));

NodeRuntime.runMain(program);
