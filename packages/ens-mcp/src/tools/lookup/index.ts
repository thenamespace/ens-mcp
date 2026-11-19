import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { getNameDetails } from "./getNameDetails/handler.js";
import { GetNameDetails } from "./getNameDetails/tool.js";
import { getPermissions } from "./getPermissions/handler.js";
import { GetPermissions } from "./getPermissions/tool.js";
import { getPrimaryName } from "./getPrimaryName/handler.js";
import { GetPrimaryName } from "./getPrimaryName/tool.js";
import { getProfile } from "./getProfile/handler.js";
import { GetProfile } from "./getProfile/tool.js";
import { getRecords } from "./getRecords/handler.js";
import { GetRecords } from "./getRecords/tool.js";
import { resolveName } from "./resolveName/handler.js";
import { ResolveName } from "./resolveName/tool.js";

const LookupToolkit = Toolkit.make(
  ResolveName,
  GetPrimaryName,
  GetProfile,
  GetRecords,
  GetNameDetails,
  GetPermissions,
);

/** The `lookup` toolset: read names, addresses, records, ownership and permissions. */
export const LookupTools = McpServer.toolkit(LookupToolkit).pipe(
  Layer.provide(
    LookupToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return {
          resolve_name: resolveName(ens),
          get_primary_name: getPrimaryName(ens),
          get_profile: getProfile(ens),
          get_records: getRecords(ens),
          get_name_details: getNameDetails(ens),
          get_permissions: getPermissions(ens),
        };
      }),
    ),
  ),
);
