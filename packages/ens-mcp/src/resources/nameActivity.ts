import { Effect, Layer } from "effect";
import { McpSchema, McpServer } from "effect/ai";

import { completeName } from "../ens/completion.js";
import { Ens } from "../ens/Ens.js";
import { Name } from "../schemas/Name.js";
import { getNameHistory } from "../tools/lists/getNameHistory/handler.js";
import { GetNameHistory } from "../tools/lists/getNameHistory/tool.js";
import { listSubnames } from "../tools/lists/listSubnames/handler.js";
import { ListSubnames } from "../tools/lists/listSubnames/tool.js";
import { json } from "./content.js";

const name = McpSchema.param("name", Name);

/** A name's subnames and recent history from the indexer. Registers nothing without one. */
export const NameActivityResources = Layer.unwrap(
  Effect.gen(function* () {
    const ens = yield* Ens;
    if (!ens.hasIndexer) return Layer.empty;
    const completion = { name: completeName(ens) };

    return Layer.mergeAll(
      McpServer.resource`ens://name/${name}/subnames`({
        name: "ENS subnames",
        description: "The first 25 subnames of a name, as list_subnames",
        mimeType: "application/json",
        completion,
        content: (_uri, value) =>
          json(ListSubnames.successSchema, listSubnames(ens)({ name: value })),
      }),
      McpServer.resource`ens://name/${name}/history`({
        name: "ENS name history",
        description: "The last 25 events of a name, newest first, as get_name_history",
        mimeType: "application/json",
        completion,
        content: (_uri, value) =>
          json(GetNameHistory.successSchema, getNameHistory(ens)({ name: value })),
      }),
    );
  }),
);
