import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import { describeSeconds, toSeconds } from "../../../schemas/Duration.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { RenewNames } from "./tool.js";

/** Handles `renew_names`. */
export const renewNames = (ens: Ens["Service"]) =>
  Effect.fn("renew_names")(function* (
    params: typeof RenewNames.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const duration = toSeconds(params.duration);

    return yield* prepareWrite(
      ens,
      Actions.registration.renew,
      {
        names: params.names,
        duration,
        account,
        ...(params.paymentToken === undefined ? {} : { paymentToken: params.paymentToken }),
      },
      `Renew ${Arr.join(params.names, ", ")} for ${describeSeconds(duration)}, signed by ${account}.`,
    );
  });
