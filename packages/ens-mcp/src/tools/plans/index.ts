import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { getPlan } from "./getPlan/handler.js";
import { GetPlan } from "./getPlan/tool.js";
import { getPlanStatus } from "./getPlanStatus/handler.js";
import { GetPlanStatus } from "./getPlanStatus/tool.js";

const PlansToolkit = Toolkit.make(GetPlan, GetPlanStatus);

/** The plan tools, offered with any toolset that prepares writes. */
export const PlansTools = McpServer.toolkit(PlansToolkit).pipe(
  Layer.provide(
    PlansToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return { get_plan: getPlan(ens), get_plan_status: getPlanStatus(ens) };
      }),
    ),
  ),
);
