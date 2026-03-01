import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/unstable/ai";

import {
  EnsProfile,
  EnsPublicActions,
  FormattedNamePrice,
  GetEnsProfileParams,
} from "@/ens";

const IsNameAvailable = Tool.make("is_name_available", {
  description: "Check if an ENS name is available",
  failure: Schema.Never,
  parameters: Schema.Struct({
    name: Schema.String.annotate({
      description: "The ENS name to check, e.g. vitalik.eth",
    }),
  }),
  success: Schema.Boolean,
});

const GetNamePrice = Tool.make("get_name_price", {
  description: "Get the price of an ENS name",
  failure: Schema.Never,
  parameters: Schema.Struct({
    duration: Schema.String.annotate({
      description:
        "The duration for which name should be minted, eg. 1 second, 1 week, 5 days, etc. Supported Units: nano(s) until year(s), should be in format of <amount> <unit>.",
    }),
    name: Schema.String.annotate({
      description: "The ENS name to get the price of",
    }),
  }),
  success: FormattedNamePrice,
});

const GetEnsProfileDescription = `
Fetch detailed ENS profile information for a given name.

This tool returns ownership, resolver, expiry status, wrapping status, address records, content hash, and specific text records depending on the requested parameters.

Use this tool when the user asks about:
- Owner of a name
- Resolver address
- Expiry date or expiry status
- Whether the name is wrapped
- Specific ENS text records (e.g., avatar, email, com.twitter)
- Specific address records (e.g., ETH, BTC)
- Content hash

Text Records are divided into two categories:
- Global Text Records (e.g., avatar, name, description, url, mail, location, etc.)
- Service Keys represented as reverse dot notation for a namespace which the service owns (e.g., com.twitter, com.github, com.discord, org.telegram, etc.)

The "textRecords" parameter allows fetching only specific text records.
The "coinRecords" parameter allows fetching only specific cryptocurrency address records.
the "contentHash" parameter allows fetching the content hash.

If no specific textRecords or coinRecords  are requested, a minimal profile (owner, resolver, expiry, wrapping status) is returned`;

const GetProfileDetails = Tool.make("get_profile_details", {
  description: GetEnsProfileDescription,
  failure: Schema.Never,
  parameters: GetEnsProfileParams,
  success: EnsProfile,
});

export const EnsPublicActionsTools = Toolkit.make(
  IsNameAvailable,
  GetNamePrice,
  GetProfileDetails,
);

export const EnsPublicActionsToolsHandlers = EnsPublicActionsTools.toLayer(
  Effect.gen(function* () {
    const publicActions = yield* EnsPublicActions;

    return {
      get_name_price: ({ duration, name }) =>
        publicActions.getPrice(name, duration),
      get_profile_details: (params) => publicActions.getEnsProfile(params),
      is_name_available: ({ name }) => publicActions.isNameAvailable(name),
    };
  }),
);
