import { Array as Arr, Effect } from "effect";

import { Actions, Role } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import { tryEns, type EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { RevokeRoles } from "./tool.js";

/** Handles `revoke_roles`. */
export const revokeRoles = (ens: Ens["Service"]) =>
  Effect.fn("revoke_roles")(function* (
    params: typeof RevokeRoles.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const holder = yield* resolveAccount(ens, params.holder);
    const target = params.target ?? "registry";
    // Registry and resolver roles share bits: names are checked against the target's table.
    const roles = yield* tryEns(() => Role.from<Role.Target>(params.roles, target));

    return yield* prepareWrite(
      ens,
      Actions.role.revoke,
      { name: params.name, account, holder, roles, target },
      `Revoke ${Arr.join(params.roles, ", ")} on ${params.name}'s ${target} from ${holder}, ` +
        `signed by ${account}.`,
    );
  });
