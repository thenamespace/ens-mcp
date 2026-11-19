import { Effect } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { resolveAccount } from "../../../ens/account.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { dnsNextStep } from "./nextStep.js";
import type { GetDnsStatus } from "./tool.js";

/** Handles `get_dns_status`. */
export const getDnsStatus = (ens: Ens["Service"]) =>
  Effect.fn("get_dns_status")(function* (
    params: typeof GetDnsStatus.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetDnsStatus.successSchema.Type, EnsToolError> {
    const owner = params.owner === undefined ? undefined : yield* resolveAccount(ens, params.owner);

    const [status, offchain] = yield* Effect.all(
      [
        runEns(Actions.dns.getStatus(ens.client, { name: params.name })),
        runEns(Actions.dns.getOffchainResolver(ens.client, { name: params.name })),
      ],
      { concurrency: "unbounded" },
    );

    return {
      name: status.name,
      imported: status.imported,
      owner: status.owner,
      dnsOwner: status.dnsOwner,
      proofValid: status.proofValid,
      action: status.action,
      ...(offchain === null ? {} : { offchainResolver: offchain }),
      next: dnsNextStep({ ...status, owner }),
    };
  });
