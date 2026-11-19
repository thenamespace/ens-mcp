import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import { toCoinInput } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { SetPrimaryName } from "./tool.js";

/** Handles `set_primary_name`. */
export const setPrimaryName = (ens: Ens["Service"]) =>
  Effect.fn("set_primary_name")(function* (
    params: typeof SetPrimaryName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);

    return yield* prepareWrite(
      ens,
      Actions.primaryName.set,
      {
        name: params.name,
        address: account,
        account,
        ...(params.coin === undefined ? {} : { coin: toCoinInput(params.coin) }),
      },
      `Make ${params.name} the primary name of ${account}${params.coin === undefined ? "" : ` on ${params.coin}`}.`,
    );
  });
