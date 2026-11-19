import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { WrapName } from "./tool.js";

/** Handles `wrap_name`. */
export const wrapName = (ens: Ens["Service"]) =>
  Effect.fn("wrap_name")(function* (
    params: typeof WrapName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);
    const burns =
      params.fuses === undefined || params.fuses.length === 0
        ? ""
        : `, burning ${Arr.join(params.fuses, ", ")} (permanent)`;

    return yield* prepareWrite(
      ens,
      Actions.wrapper.wrap,
      {
        name: params.name,
        account,
        ...(owner === undefined ? {} : { owner }),
        ...(params.fuses === undefined ? {} : { fuses: params.fuses }),
        ...(params.resolver === undefined ? {} : { resolver: params.resolver }),
      },
      `Wrap ${params.name}${owner === undefined ? "" : ` for ${owner}`}${burns}, signed by ${account}.`,
    );
  });
