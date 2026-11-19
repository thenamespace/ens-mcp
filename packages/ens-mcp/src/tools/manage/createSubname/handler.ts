import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { toRecordOptions } from "../../../schemas/Records.js";
import type { CreateSubname } from "./tool.js";

const resolverOption = (resolver: typeof CreateSubname.parametersSchema.Type.resolver) => {
  switch (resolver) {
    case undefined:
    case "own":
      return {};
    case "none":
      return { resolver: null };
    default:
      return { resolver };
  }
};

/** Handles `create_subname`. */
export const createSubname = (ens: Ens["Service"]) =>
  Effect.fn("create_subname")(function* (
    params: typeof CreateSubname.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);

    return yield* prepareWrite(
      ens,
      Actions.subname.create,
      {
        name: params.name,
        account,
        ...(owner === undefined ? {} : { owner }),
        ...resolverOption(params.resolver),
        ...(params.records === undefined ? {} : { records: toRecordOptions(params.records) }),
        ...(params.expiry === undefined
          ? {}
          : { expiry: BigInt(Math.floor(params.expiry.getTime() / 1000)) }),
        ...(params.fuses === undefined ? {} : { fuses: params.fuses }),
        ...(params.roles === undefined ? {} : { roles: params.roles }),
      },
      `Create ${params.name}${owner === undefined ? "" : ` for ${owner}`}, signed by ${account}.`,
    );
  });
