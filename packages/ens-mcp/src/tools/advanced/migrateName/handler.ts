import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import { toSeconds } from "../../../schemas/Duration.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { MigrateName } from "./tool.js";

/** Handles `migrate_name`. */
export const migrateName = (ens: Ens["Service"]) =>
  Effect.fn("migrate_name")(function* (
    params: typeof MigrateName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);

    return yield* prepareWrite(
      ens,
      Actions.migration.migrate,
      {
        names: params.names,
        account,
        ...(params.resolver === undefined
          ? {}
          : { resolver: params.resolver === "shared" ? "owned" : params.resolver }),
        ...(owner === undefined ? {} : { owner }),
        ...(params.preserveManager === undefined
          ? {}
          : { preserveManager: params.preserveManager }),
        ...(params.renew === undefined
          ? {}
          : {
              renew: {
                duration: toSeconds(params.renew),
                ...(params.paymentToken === undefined ? {} : { paymentToken: params.paymentToken }),
              },
            }),
        ...(params.allowLeavingSubnames === undefined
          ? {}
          : { allowLeavingSubnames: params.allowLeavingSubnames }),
      },
      `Migrate ${Arr.join(params.names, ", ")} to ENSv2${owner === undefined ? "" : ` for ${owner}`}, ` +
        `signed by ${account}. Migration is one-way.`,
    );
  });
