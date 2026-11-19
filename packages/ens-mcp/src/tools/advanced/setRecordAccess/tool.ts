import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Account, AddressOrName } from "../../../schemas/Address.js";
import { Coin } from "../../../schemas/Coin.js";
import { Name } from "../../../schemas/Name.js";
import { PreparedWrite } from "../../../schemas/PreparedWrite.js";
import { TextKey } from "../../../schemas/TextKey.js";
import { ReadsEns } from "../../annotations.js";

/** Prepares giving or taking an account's access to some of a name's records. */
export const SetRecordAccess = Tool.make("set_record_access", {
  description:
    "Prepare letting another account edit some or all of an ENSv2 name's records, or taking that " +
    "access back, for the user to sign in their own wallet, e.g. 'Let 0xabc… edit only the " +
    "avatar of alice.eth'. Nothing is sent. Needs a PermissionedResolver (ENSv2). Leave out " +
    "texts, coins and contentHash to grant every record.",
  parameters: Schema.Struct({
    name: Name,
    account: Account,
    grantee: AddressOrName.annotate({ description: "Who gets the access: an address or ENS name" }),
    texts: Schema.optionalKey(Schema.Array(TextKey).check(Schema.isMaxLength(50))).annotate({
      description: "Text record keys, e.g. avatar, url",
    }),
    coins: Schema.optionalKey(Schema.Array(Coin).check(Schema.isMaxLength(50))).annotate({
      description: "Address records by coin, e.g. eth, btc",
    }),
    contentHash: Schema.optionalKey(Schema.Boolean).annotate({
      description: "The content hash (website)",
    }),
    revoke: Schema.optionalKey(Schema.Boolean).annotate({ description: "Take the access back" }),
  }),
  success: PreparedWrite,
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Prepare record access")
  .annotateMerge(ReadsEns);
