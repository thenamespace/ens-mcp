import { Array as Arr, Layer } from "effect";

import { AddressResources } from "../resources/address.js";
import { NameResources } from "../resources/name.js";
import { NameActivityResources } from "../resources/nameActivity.js";
import { ChainResource } from "../resources/reference/chain.js";
import { ErrorResources } from "../resources/reference/errors.js";
import { RecordsResource } from "../resources/reference/records.js";
import { EnsSkill } from "../skills/index.js";
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
export const registrations = (enabled: ReadonlyArray<Toolset>) => {
  const has = (toolset: Toolset) => Arr.contains(enabled, toolset);
  return Layer.mergeAll(
    Layer.empty,
    ...Arr.map(enabled, (toolset) => toolsets[toolset]),
    ...(Arr.some(enabled, (toolset) => Arr.contains(writeToolsets, toolset)) ? [PlansTools] : []),
    ...(has("lookup") ? [NameResources, AddressResources({ names: has("lists") })] : []),
    ...(has("lists") ? [NameActivityResources] : []),
    ChainResource,
    ErrorResources,
    RecordsResource,
    EnsSkill,
  );
};
