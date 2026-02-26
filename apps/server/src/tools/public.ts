import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/unstable/ai";

import { EnsPublicActions } from "@/ens";

const GetOwnerTool = Tool.make("getOwner", {
  description: "Get Owner of a ens name or subname",
  failure: Schema.Never,
  parameters: Schema.Struct({
    name: Schema.String.annotate({
      description:
        "The ENS name or subname to get the owner of, eg. vitalik.eth",
    }),
  }),
  success: Schema.String.pipe(Schema.optional),
});

export const EnsPublicActionsTools = Toolkit.make(GetOwnerTool);

export const EnsPublicActionsToolsHandlers = EnsPublicActionsTools.toLayer(
  Effect.gen(function* () {
    const publicActions = yield* EnsPublicActions;
    return {
      getOwner: ({ name }) => publicActions.getOwner(name),
    };
  }),
);
