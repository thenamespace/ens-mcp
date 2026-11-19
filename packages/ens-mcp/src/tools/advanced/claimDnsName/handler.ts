import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import type { EnsToolError } from "../../../ens/errors.js";
import { prepareWrite } from "../../../ens/prepare.js";
import type { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import type { ClaimDnsName } from "./tool.js";

/** Handles `claim_dns_name`. */
export const claimDnsName = (ens: Ens["Service"]) =>
  Effect.fn("claim_dns_name")(function* (
    params: typeof ClaimDnsName.parametersSchema.Type,
  ): Effect.fn.Return<typeof PreparedWrite.Type, EnsToolError> {
    const account = yield* resolveAccount(ens, params.account);

    return yield* prepareWrite(
      ens,
      Actions.dns.claim,
      {
        name: params.name,
        account,
        ...(params.resolver === undefined ? {} : { resolver: params.resolver }),
      },
      `Claim ${params.name} into ENS with its DNSSEC proof, signed by ${account}.`,
    );
  });
