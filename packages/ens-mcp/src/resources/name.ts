import { Effect, Layer } from "effect";
import { McpSchema, McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { Name } from "../schemas/Name.js";
import { getNameDetails } from "../tools/lookup/getNameDetails/handler.js";
import { GetNameDetails } from "../tools/lookup/getNameDetails/tool.js";
import { getProfile } from "../tools/lookup/getProfile/handler.js";
import { GetProfile } from "../tools/lookup/getProfile/tool.js";
import { json } from "./content.js";

const name = McpSchema.param("name", Name);

/** A name's profile and its ownership state, read on demand as `get_profile` and `get_name_details` do. */
export const NameResources = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;
    const completion = { name: completeName(ens) };

    return Layer.mergeAll(
      McpServer.resource`ens://name/${name}`({
        name: "ENS name profile",
        description: "A name's addresses, text records, content hash and avatar, as get_profile",
        mimeType: "application/json",
        completion,
        content: (_uri, value) => json(GetProfile.successSchema, getProfile(ens)({ name: value })),
      }),
      McpServer.resource`ens://name/${name}/details`({
        name: "ENS name details",
        description: "Who owns a name, its status, expiry and resolver, as get_name_details",
        mimeType: "application/json",
        completion,
        content: (_uri, value) =>
          json(
            GetNameDetails.successSchema,
            getNameDetails(ens)({ name: value, include: ["fuses", "migration"] }),
          ),
      }),
    );
  }),
);
