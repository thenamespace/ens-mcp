import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { UnwrapName } from "./tool.js";

/** Handles `unwrap_name`. */
export const unwrapName = (ens: Ens["Service"]) =>
  Effect.fn("unwrap_name")(function* (
    params: typeof UnwrapName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);

    return yield* prepareWrite(
      ens,
      Actions.wrapper.unwrap,
      { name: params.name, account, ...(owner === undefined ? {} : { owner }) },
      `Unwrap ${params.name}${owner === undefined ? "" : ` to ${owner}`}, signed by ${account}.`,
    );
  });
