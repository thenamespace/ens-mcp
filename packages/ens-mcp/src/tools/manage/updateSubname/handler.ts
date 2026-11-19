import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { toUnixSeconds } from "../../../schemas/Timestamp.js";
import type { UpdateSubname } from "./tool.js";

/** Handles `update_subname`. */
export const updateSubname = (ens: Ens["Service"]) =>
  Effect.fn("update_subname")(function* (
    params: typeof UpdateSubname.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);

    return yield* prepareWrite(
      ens,
      Actions.subname.update,
      {
        name: params.name,
        account,
        ...(owner === undefined ? {} : { owner }),
        ...(params.resolver === undefined
          ? {}
          : { resolver: params.resolver === "none" ? null : params.resolver }),
        ...(params.expiry === undefined ? {} : { expiry: toUnixSeconds(params.expiry) }),
      },
      `Update ${params.name}, signed by ${account}.`,
    );
  });
