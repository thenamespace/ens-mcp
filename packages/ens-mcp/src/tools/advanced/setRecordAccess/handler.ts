import { Array as Arr, Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import { toCoinInput } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { SetRecordAccess } from "./tool.js";

/** Handles `set_record_access`. */
export const setRecordAccess = (ens: Ens["Service"]) =>
  Effect.fn("set_record_access")(function* (
    params: typeof SetRecordAccess.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const grantee = yield* resolveAccount(ens, params.grantee);

    const listed = [
      ...(params.texts ?? []),
      ...Arr.map(params.coins ?? [], (coin) => `${coin} address`),
      ...(params.contentHash === true ? ["content hash"] : []),
    ];
    // Granting every record is wider than any list, which ensforge asks callers to confirm.
    const records =
      listed.length === 0
        ? ("all" as const)
        : {
            ...(params.texts === undefined ? {} : { texts: params.texts }),
            ...(params.coins === undefined
              ? {}
              : { addresses: Arr.map(params.coins, toCoinInput) }),
            ...(params.contentHash === true ? { contentHash: true as const } : {}),
          };
    const scope = listed.length === 0 ? "every record" : `these records: ${Arr.join(listed, ", ")}`;

    return yield* prepareWrite(
      ens,
      Actions.permission.setRecordAccess,
      {
        name: params.name,
        account,
        grantee,
        records,
        ...(records === "all" ? { allowScopeWidening: true } : {}),
        ...(params.revoke === true ? { revoke: true } : {}),
      },
      params.revoke === true
        ? `Take back ${grantee}'s access to ${params.name}'s ${scope}, signed by ${account}.`
        : `Let ${grantee} edit ${params.name}'s ${scope}, signed by ${account}.`,
    );
  });
