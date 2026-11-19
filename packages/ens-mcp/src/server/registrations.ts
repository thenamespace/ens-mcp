import { Array as Arr, Layer } from "effect";

import { AdvancedTools } from "../tools/advanced/index.js";
import { ListsTools } from "../tools/lists/index.js";
import { LookupTools } from "../tools/lookup/index.js";
import { ManageTools } from "../tools/manage/index.js";
import { PlansTools } from "../tools/plans/index.js";
import { RegisterTools } from "../tools/register/index.js";
import { UtilsTools } from "../tools/utils/index.js";
import type { Toolset } from "../Toolset.js";

const toolsets = {
  lookup: LookupTools,
  lists: ListsTools,
  register: RegisterTools,
  manage: ManageTools,
  advanced: AdvancedTools,
  utils: UtilsTools,
} satisfies Record<Toolset, Layer.Layer<never, never, unknown>>;

/** Toolsets that prepare writes, which bring the plan tools with them. */
export const writeToolsets: ReadonlyArray<Toolset> = ["register", "manage", "advanced"];

/** The tools, resources and prompts of the enabled toolsets. */
export const registrations = (enabled: ReadonlyArray<Toolset>) =>
  Layer.mergeAll(
    Layer.empty,
    ...Arr.map(enabled, (toolset) => toolsets[toolset]),
    ...(Arr.some(enabled, (toolset) => Arr.contains(writeToolsets, toolset)) ? [PlansTools] : []),
  );
