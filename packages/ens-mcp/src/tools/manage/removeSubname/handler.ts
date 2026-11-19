import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { RemoveSubname } from "./tool.js";

/** Handles `remove_subname`. */
export const removeSubname = (ens: Ens["Service"]) =>
  Effect.fn("remove_subname")(function* (
    params: typeof RemoveSubname.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);

    return yield* prepareWrite(
      ens,
      Actions.subname.remove,
      { name: params.name, account },
      `Remove ${params.name}, signed by ${account}.`,
    );
  });
