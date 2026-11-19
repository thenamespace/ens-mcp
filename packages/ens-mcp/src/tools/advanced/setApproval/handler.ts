import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { SetApproval } from "./tool.js";

/** Handles `set_approval`. */
export const setApproval = (ens: Ens["Service"]) =>
  Effect.fn("set_approval")(function* (
    params: typeof SetApproval.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);
    const to = yield* resolveAccount(ens, params.to);
    const approved = params.approved ?? true;
    // The schema requires `contract` for operators and `name` otherwise.
    const name = params.name ?? "";
    const verb = approved ? "Approve" : "Revoke";

    switch (params.kind) {
      case "operator":
        return yield* prepareWrite(
          ens,
          Actions.approval.setOperator,
          { account, operator: to, approved, contract: params.contract ?? "registry" },
          `${verb} ${to} as operator of ${account}'s names on the ${params.contract ?? "registry"}.`,
        );
      case "delegate":
        return yield* prepareWrite(
          ens,
          Actions.approval.setDelegate,
          { account, name, delegate: to, approved },
          `${verb} ${to} as delegate of ${name}, signed by ${account}.`,
        );
      default:
        return yield* prepareWrite(
          ens,
          Actions.approval.setToken,
          { account, name, to: approved ? to : null },
          approved
            ? `Approve ${to} to move ${name}'s token, signed by ${account}.`
            : `Clear the token approval of ${name}, signed by ${account}.`,
        );
    }
  });
