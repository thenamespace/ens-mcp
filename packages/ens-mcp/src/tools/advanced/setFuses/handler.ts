import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { toUnixSeconds } from "../../../schemas/Timestamp.js";
import type { SetFuses } from "./tool.js";

/** Handles `set_fuses`. */
export const setFuses = (ens: Ens["Service"]) =>
  Effect.fn("set_fuses")(function* (
    params: typeof SetFuses.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const fuses = params.fuses ?? [];
    const summary =
      fuses.length === 0
        ? `Extend ${params.name}'s expiry, signed by ${account}.`
        : `Burn ${Arr.join(fuses, ", ")} on ${params.name}, signed by ${account}. This is permanent.`;

    if (params.child === true)
      return yield* prepareWrite(
        ens,
        Actions.wrapper.setChildFuses,
        {
          name: params.name,
          account,
          ...(fuses.length === 0 ? {} : { fuses }),
          ...(params.expiry === undefined ? {} : { expiry: toUnixSeconds(params.expiry) }),
        },
        summary,
      );
    return yield* prepareWrite(
      ens,
      Actions.wrapper.setFuses,
      { name: params.name, account, fuses },
      summary,
    );
  });
