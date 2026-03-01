import { Effect, Schema } from "effect";
import { Tool, Toolkit } from "effect/unstable/ai";

import {
  EnsSubgraphActions,
  GetNameHistoryParams,
  GetNameHistoryResponse,
  GetNamesForAddressParams,
  GetNamesForAddressResponse,
  GetSubgraphRecordsParams,
  GetSubgraphRecordsResponse,
  GetSubnamesForNameParams,
  GetSubnamesForNameResponse,
} from "@/ens";

const GetSubnamesForNameDescription = `
Retrieve subnames (subdomains) under a given ENS name.

Use this tool when the user asks about:
- Subdomains of a name
- Listing children of a parent ENS name
- Discovering delegated subnames
- Exploring namespace structure under a name

Supports filtering by subname label, sorting, pagination, and optionally including expired or deleted subnames.

If no filters are specified, returns active subnames ordered alphabetically by name.`;

const GetSubnamesForName = Tool.make("get_subnames_for_name", {
  description: GetSubnamesForNameDescription,
  failure: Schema.Never,
  parameters: GetSubnamesForNameParams,
  success: GetSubnamesForNameResponse,
});

const GetNamesForAddressDescription = `
Retrieve ens names for a given address.

Use this tool when the user asks about:
- Names owned by a given address
- Listing names owned by a given address
- Discovering names owned by a given address
- Exploring namespace structure for a given address

Supports filtering by name type, sorting, pagination, and optionally including expired or deleted names.

If no filters are specified, returns active names ordered alphabetically by name.`;

const GetNamesForAddress = Tool.make("get_names_for_address", {
  description: GetNamesForAddressDescription,
  failure: Schema.Never,
  parameters: GetNamesForAddressParams,
  success: GetNamesForAddressResponse,
});

export const GetNameHistoryDescription = `
Retrieve history of an ENS name.

Use this tool when the user asks about:
- Events of an ENS name
- Historical events of an ENS name, eg. transfers, registrations, expirations, text record changes, renewals, resolver changes, etc.
`;

const GetNameHistory = Tool.make("get_name_history", {
  description: GetNameHistoryDescription,
  failure: Schema.Never,
  parameters: GetNameHistoryParams,
  success: GetNameHistoryResponse,
});

const GetSubgraphRecordsDescription = `
Retrieve records keys associated with an ENS name.

Use this tool when the user asks about:
- All Text/Address keys associated with an ENS name, not the associated values.
- Complete list of all records associated with an ENS name (use these values to get profile details)`;

const GetSubgraphRecords = Tool.make("get_subgraph_records", {
  description: GetSubgraphRecordsDescription,
  failure: Schema.Never,
  parameters: GetSubgraphRecordsParams,
  success: GetSubgraphRecordsResponse,
});

export const EnsSubgraphActionsTools = Toolkit.make(
  GetSubnamesForName,
  GetNamesForAddress,
  GetNameHistory,
  GetSubgraphRecords,
);

export const EnsSubgraphActionsToolsHandlers = EnsSubgraphActionsTools.toLayer(
  Effect.gen(function* () {
    const subgraphActions = yield* EnsSubgraphActions;

    return {
      get_name_history: (params) => subgraphActions.getNameHistory(params),
      get_names_for_address: (params) =>
        subgraphActions.getNamesForAddress(params),
      get_subgraph_records: (params) =>
        subgraphActions.getSubgraphRecords(params),
      get_subnames_for_name: (params) =>
        subgraphActions.getSubnamesForName(params),
    };
  }),
);
