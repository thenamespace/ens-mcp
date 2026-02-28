import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/unstable/ai";

import {
  EnsSubgraphActions,
  GetSubnamesForNameParams,
  GetSubnamesForNameResponse,
} from "@/ens";

const GetSubnamesForNameDescription = `
Retrieve subnames (subdomains) under a given ENS name.

Use this tool when the user asks about:
- Subdomains of a name
- Listing children of a parent ENS name
- Discovering delegated subnames
- Exploring namespace structure under a name

Supports filtering by subname label, sorting, pagination, and optionally including expired or deleted subnames.

If no filters are specified, returns active subnames ordered alphabetically by name.`;

const GetSubnamesForName = Tool.make("get_subnames_for_name", {
  description: GetSubnamesForNameDescription,
  failure: Schema.Never,
  parameters: GetSubnamesForNameParams,
  success: GetSubnamesForNameResponse,
});

export const EnsSubgraphActionsTools = Toolkit.make(GetSubnamesForName);

export const EnsSubgraphActionsToolsHandlers = EnsSubgraphActionsTools.toLayer(
  Effect.gen(function* () {
    const subgraphActions = yield* EnsSubgraphActions;
    return {
      get_subnames_for_name: (params) =>
        subgraphActions.getSubnamesForName(params),
    };
  }),
);
