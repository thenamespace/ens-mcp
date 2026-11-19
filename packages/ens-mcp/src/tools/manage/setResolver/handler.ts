import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { SetResolver } from "./tool.js";

/** Handles `set_resolver`. */
export const setResolver = (ens: Ens["Service"]) =>
  Effect.fn("set_resolver")(function* (
    params: typeof SetResolver.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);

    return yield* prepareWrite(
      ens,
      Actions.resolver.set,
      {
        name: params.name,
        account,
        resolver: params.resolver === "none" ? null : params.resolver,
      },
      `Set the resolver of ${params.name} to ${params.resolver}, signed by ${account}.`,
    );
  });
