import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { GrantRoles } from "./tool.js";

/** Handles `grant_roles`. */
export const grantRoles = (ens: Ens["Service"]) =>
  Effect.fn("grant_roles")(function* (
    params: typeof GrantRoles.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const grantee = yield* resolveAccount(ens, params.grantee);
    const target = params.target ?? "registry";

    return yield* prepareWrite(
      ens,
      Actions.role.grant,
      { name: params.name, account, grantee, roles: params.roles, target },
      `Grant ${Arr.join(params.roles, ", ")} on ${params.name}'s ${target} to ${grantee}, ` +
        `signed by ${account}.`,
    );
  });
