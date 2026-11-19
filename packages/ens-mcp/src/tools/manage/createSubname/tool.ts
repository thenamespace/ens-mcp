import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, Address, AddressOrName } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { FuseName, RegistryRole } from "../../../schemas/Permissions.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { RecordChanges } from "../../../schemas/Records.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares creating a subname. */
export const CreateSubname = Tool.make("create_subname", {
  description:
    "Prepare creating a subname for the user to sign in their own wallet, e.g. 'Create " +
    "pay.alice.eth for 0xabc… with its ETH address set'. Nothing is sent. The account must " +
    "control the parent name. Can set the owner, records, resolver and expiry; fuses apply to " +
    "wrapped ENSv1 parents and roles to ENSv2 parents. Returns the steps, whether the account may " +
    "make the change, plain signing instructions and the unsigned calls.",
  parameters: Schema.Struct({
    name: Name.annotate({ description: "Full subname to create, e.g. pay.alice.eth" }),
    account: Account,
    owner: Schema.optionalKey(AddressOrName).annotate({
      description: "Who will own the subname. Default: the account",
    }),
    records: Schema.optionalKey(RecordChanges),
    resolver: Schema.optionalKey(
      Schema.Union([Schema.Literals(["own", "parent", "none"]), Address]),
    ).annotate({
      description:
        "own (default): a new resolver for the subname; parent: the parent's resolver; none; or " +
        "a resolver address",
    }),
    expiry: Schema.optionalKey(Schema.DateFromString).annotate({
      description: "When the subname expires, ISO 8601. Default: never on ENSv2",
    }),
    fuses: Schema.optionalKey(Schema.Array(FuseName)).annotate({
      description: "NameWrapper fuses to burn on the subname (wrapped parents); permanent",
    }),
    roles: Schema.optionalKey(Schema.Array(RegistryRole)).annotate({
      description: "ENSv2 roles the owner gets on the subname",
    }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare creating a subname")
  .annotateMerge(ReadsEns);
