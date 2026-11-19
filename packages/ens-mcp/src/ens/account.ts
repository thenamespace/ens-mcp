import { Effect } from "effect";

import { Actions, Errors } from "@ensforge/sdk/effect";
import { isAddress } from "viem";

import type { Ens } from "./Ens.js";
import { runEns, toToolError } from "./errors.js";

/**
 * The address an `AddressOrName` parameter stands for: an address as given, or the ETH address an
 * ENS name resolves to.
 */
export const resolveAccount = Effect.fnUntraced(function* (ens: Ens["Service"], input: string) {
  if (isAddress(input)) return input;

  const address = yield* runEns(Actions.record.getAddress(ens.client, { name: input }));
  if (address === null)
    return yield* toToolError(
      new Errors.NotFoundError({
        code: "RECORD_NOT_FOUND",
        resource: `ETH address of ${input}`,
        context: { name: input },
      }),
    );
  return address;
});
