import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { FuseName } from "../../../schemas/Permissions.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares wrapping an ENSv1 name in the NameWrapper. */
export const WrapName = Tool.make("wrap_name", {
  description:
    "Prepare wrapping an ENSv1 name in the NameWrapper for the user to sign in their own wallet, " +
    "e.g. 'Wrap alice.eth'. Nothing is sent. Wrapping turns the name into an ERC-1155 token and " +
    "enables fuses; fuses burned while wrapping are permanent. ENSv2 names are not wrapped.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "Owner of the wrapped name. Default: its current holder",
    }),
    fuses: Schema.optionalKey(Schema.Array(FuseName)).annotate({
      description: "Fuses to burn while wrapping (.eth second-level names only); permanent",
    }),
    resolver: Schema.optionalKey(Address).annotate({
      description: "Resolver to set. Default: the current one",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare wrapping a name")
  .annotateMerge(ReadsEns);
