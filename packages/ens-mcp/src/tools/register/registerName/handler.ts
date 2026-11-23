import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import { describeSeconds, toSeconds } from "../../../schemas/Duration.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { toRecordOptions } from "../../../schemas/Records.js";
import type { RegisterName } from "./tool.js";

const resolverOption = (resolver: typeof RegisterName.parametersSchema.Type.resolver) => {
  switch (resolver) {
    // ensforge defaults to the shared resolver for names the signer owns; this tool documents its own.
    case undefined:
    case "own":
      return { resolver: "new" };
    case "shared":
      return { resolver: "owned" };
    case "none":
      return { resolver: null };
    default:
      return { resolver };
  }
};

/** Handles `register_name`. */
export const registerName = (ens: Ens["Service"]) =>
  Effect.fn("register_name")(function* (
    params: typeof RegisterName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);
    const duration = toSeconds(params.duration);

    return yield* prepareWrite(
      ens,
      Actions.registration.register,
      {
        names: params.names,
        duration,
        account,
        ...(owner === undefined ? {} : { owner }),
        ...resolverOption(params.resolver),
        ...(params.records === undefined ? {} : { records: toRecordOptions(params.records) }),
        ...(params.setPrimaryName === undefined ? {} : { primaryName: params.setPrimaryName }),
        ...(params.paymentToken === undefined ? {} : { paymentToken: params.paymentToken }),
      },
      `Register ${Arr.join(params.names, ", ")} for ${describeSeconds(duration)}` +
        `${owner === undefined ? "" : ` to ${owner}`}, signed by ${account}.`,
    );
  });
