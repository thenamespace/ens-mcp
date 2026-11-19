import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { TransferName } from "./tool.js";

/** Handles `transfer_name`. */
export const transferName = (ens: Ens["Service"]) =>
  Effect.fn("transfer_name")(function* (
    params: typeof TransferName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const to = yield* resolveAccount(ens, params.to);

    return yield* prepareWrite(
      ens,
      Actions.name.transfer,
      {
        name: params.name,
        account,
        to,
        ...(params.role === undefined ? {} : { role: params.role }),
        ...(params.records === undefined ? {} : { records: params.records }),
      },
      `Transfer ${params.name} from ${account} to ${to}${params.to === to ? "" : ` (${params.to})`}.`,
    );
  });
