import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { createSubname } from "./createSubname/handler.js";
import { CreateSubname } from "./createSubname/tool.js";
import { removeSubname } from "./removeSubname/handler.js";
import { RemoveSubname } from "./removeSubname/tool.js";
import { setPrimaryName } from "./setPrimaryName/handler.js";
import { SetPrimaryName } from "./setPrimaryName/tool.js";
import { setRecords } from "./setRecords/handler.js";
import { SetRecords } from "./setRecords/tool.js";
import { setResolver } from "./setResolver/handler.js";
import { SetResolver } from "./setResolver/tool.js";
import { transferName } from "./transferName/handler.js";
import { TransferName } from "./transferName/tool.js";
import { updateSubname } from "./updateSubname/handler.js";
import { UpdateSubname } from "./updateSubname/tool.js";

const ManageToolkit = Toolkit.make(
  SetRecords,
  SetPrimaryName,
  CreateSubname,
  UpdateSubname,
  RemoveSubname,
  TransferName,
  SetResolver,
);

/** The `manage` toolset: record, primary name, subname, transfer and resolver changes to sign. */
export const ManageTools = McpServer.toolkit(ManageToolkit).pipe(
  Layer.provide(
    ManageToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return {
          set_records: setRecords(ens),
          set_primary_name: setPrimaryName(ens),
          create_subname: createSubname(ens),
          update_subname: updateSubname(ens),
          remove_subname: removeSubname(ens),
          transfer_name: transferName(ens),
          set_resolver: setResolver(ens),
        };
      }),
    ),
  ),
);
