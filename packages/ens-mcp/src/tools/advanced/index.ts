import { Effect, Layer } from "effect";
import { McpServer, Toolkit } from "effect/ai";

import { Ens } from "../../ens/Ens.js";
import { claimDnsName } from "./claimDnsName/handler.js";
import { ClaimDnsName } from "./claimDnsName/tool.js";
import { getDnsStatus } from "./getDnsStatus/handler.js";
import { GetDnsStatus } from "./getDnsStatus/tool.js";
import { getMigrationStatus } from "./getMigrationStatus/handler.js";
import { GetMigrationStatus } from "./getMigrationStatus/tool.js";
import { grantRoles } from "./grantRoles/handler.js";
import { GrantRoles } from "./grantRoles/tool.js";
import { migrateName } from "./migrateName/handler.js";
import { MigrateName } from "./migrateName/tool.js";
import { revokeRoles } from "./revokeRoles/handler.js";
import { RevokeRoles } from "./revokeRoles/tool.js";
import { setApproval } from "./setApproval/handler.js";
import { SetApproval } from "./setApproval/tool.js";
import { setFuses } from "./setFuses/handler.js";
import { SetFuses } from "./setFuses/tool.js";
import { setRecordAccess } from "./setRecordAccess/handler.js";
import { SetRecordAccess } from "./setRecordAccess/tool.js";
import { unwrapName } from "./unwrapName/handler.js";
import { UnwrapName } from "./unwrapName/tool.js";
import { wrapName } from "./wrapName/handler.js";
import { WrapName } from "./wrapName/tool.js";

const AdvancedToolkit = Toolkit.make(
  WrapName,
  UnwrapName,
  SetFuses,
  GrantRoles,
  RevokeRoles,
  SetRecordAccess,
  SetApproval,
  GetMigrationStatus,
  MigrateName,
  GetDnsStatus,
  ClaimDnsName,
);

/** The `advanced` toolset: wrapping, fuses, roles, approvals, ENSv2 migration and DNS names. */
export const AdvancedTools = McpServer.toolkit(AdvancedToolkit).pipe(
  Layer.provide(
    AdvancedToolkit.toLayer(
      Effect.gen(function* () {
        const ens = yield* Ens;
        return {
          wrap_name: wrapName(ens),
          unwrap_name: unwrapName(ens),
          set_fuses: setFuses(ens),
          grant_roles: grantRoles(ens),
          revoke_roles: revokeRoles(ens),
          set_record_access: setRecordAccess(ens),
          set_approval: setApproval(ens),
          get_migration_status: getMigrationStatus(ens),
          migrate_name: migrateName(ens),
          get_dns_status: getDnsStatus(ens),
          claim_dns_name: claimDnsName(ens),
        };
      }),
    ),
  ),
);
