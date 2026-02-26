import { Tool, Toolkit } from "@effect/ai";
import { Effect, Schema } from "effect";

import {
  EnsProfile,
  EnsPublicActions,
  FormattedNamePrice,
  GetEnsProfileParams,
} from "@/ens";

const GetOwner = Tool.make("GetOwner", {
  description: "Get Owner of a ens name or subname",
  failure: Schema.Never,
  parameters: {
    name: Schema.String.annotations({
      description:
        "The ENS name or subname to get the owner of, eg. vitalik.eth",
    }),
  },
  success: Schema.Union(Schema.String, Schema.Undefined),
});

const IsNameAvailable = Tool.make("IsNameAvailable", {
  description: "Check if an ENS name is available",
  failure: Schema.Never,
  parameters: {
    name: Schema.String.annotations({
      description: "The ENS name to check, e.g. vitalik.eth",
    }),
  },
  success: Schema.Boolean,
});

const GetNamePrice = Tool.make("GetNamePrice", {
  description: "Get the price of an ENS name",
  failure: Schema.Never,
  parameters: {
    duration: Schema.String.annotations({
      description:
        "The duration for which name should be minted, eg. 1 second, 1 week, 5 days, etc. Supported Units: nano(s) until year(s), should be in format of <amount> <unit>.",
    }),
    name: Schema.String.annotations({
      description: "The ENS name to get the price of",
    }),
  },
  success: FormattedNamePrice,
});

const GetProfileDetails = Tool.make("GetProfileDetails", {
  description: "Get the price of an ENS name",
  failure: Schema.Never,
  parameters: GetEnsProfileParams.fields,
  success: EnsProfile,
});

export const EnsPublicActionsTools = Toolkit.make(
  GetOwner,
  IsNameAvailable,
  GetNamePrice,
);

export const EnsPublicActionsToolsHandlers = EnsPublicActionsTools.toLayer(
  Effect.gen(function* () {
    const publicActions = yield* EnsPublicActions;
    return {
      GetNamePrice: ({ duration, name }) =>
        publicActions.getPrice(name, duration),
      GetOwner: ({ name }) => publicActions.getOwner(name),
      IsNameAvailable: ({ name }) => publicActions.isNameAvailable(name),
    };
  }),
);
