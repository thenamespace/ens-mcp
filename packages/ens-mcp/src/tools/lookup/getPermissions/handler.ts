import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import type { GetPermissions } from "./tool.js";

/** Handles `get_permissions`. */
export const getPermissions = (ens: Ens["Service"]) =>
  Effect.fn("get_permissions")(function* (
    params: typeof GetPermissions.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetPermissions.successSchema.Type, EnsToolError> {
    const { name, account } = params;

    const [permissions, roles] = yield* Effect.all(
      [
        runEns(Actions.permission.get(ens.client, { name, account })),
        // Roles exist on ENSv2 registries only; ENSv1 names and unregistered names have none.
        runEns(
          Actions.role.get(ens.client, { name, account, target: "registry" }).pipe(
            Effect.map(({ names }) => names),
            Effect.catchTag(["UnsupportedError", "NotFoundError"], () => Effect.undefined),
          ),
        ),
      ],
      { concurrency: "unbounded" },
    );

    return {
      name,
      account: permissions.account,
      status: permissions.status,
      can: permissions.can,
      fuses: permissions.fuses,
      ...(roles === undefined ? {} : { roles }),
    };
  });
