import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { toRecordOptions } from "../../../schemas/Records.js";
import type { SetRecords } from "./tool.js";

/** Handles `set_records`. */
export const setRecords = (ens: Ens["Service"]) =>
  Effect.fn("set_records")(function* (
    params: typeof SetRecords.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);

    return yield* prepareWrite(
      ens,
      Actions.record.set,
      {
        name: params.name,
        account,
        ...toRecordOptions(params),
        ...(params.clearFirst === true ? { clear: true } : {}),
      },
      `${params.clearFirst === true ? "Clear and set" : "Set"} records of ${params.name}, signed by ${account}.`,
    );
  });
