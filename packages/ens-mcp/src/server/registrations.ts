import { Array as Arr, Layer } from "effect";

import { ListsTools } from "../tools/lists/index.js";
import { LookupTools } from "../tools/lookup/index.js";
import { UtilsTools } from "../tools/utils/index.js";
import type { Toolset } from "../Toolset.js";

// A toolset without tools yet registers nothing.
const toolsets = {
  lookup: LookupTools,
  lists: ListsTools,
  register: Layer.empty,
  manage: Layer.empty,
  advanced: Layer.empty,
  utils: UtilsTools,
} satisfies Record<Toolset, Layer.Layer<never, never, unknown>>;

/** The tools, resources and prompts of the enabled toolsets. */
export const registrations = (enabled: ReadonlyArray<Toolset>) =>
  Layer.mergeAll(Layer.empty, ...Arr.map(enabled, (toolset) => toolsets[toolset]));
