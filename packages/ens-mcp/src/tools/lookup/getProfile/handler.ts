import { Array as Arr, Effect, Option, Record as Rec } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import { toCoinInput } from "../../../ens/coinType.js";
import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import { cleanRecordText } from "../../../ens/recordText.js";
import type { GetProfile } from "./tool.js";

const profileTexts = [
  "avatar",
  "description",
  "display",
  "url",
  "email",
  "location",
  "keywords",
  "com.twitter",
  "com.github",
  "com.discord",
  "org.telegram",
  "xyz.farcaster",
];

/** Handles `get_profile`. */
export const getProfile = (ens: Ens["Service"]) =>
  Effect.fn("get_profile")(function* (
    params: typeof GetProfile.parametersSchema.Type,
  ): Effect.fn.Return<typeof GetProfile.successSchema.Type, EnsToolError> {
    const { name } = params;

    const [records, avatarUrl] = yield* Effect.all(
      [
        runEns(
          Actions.record.get(ens.client, {
            name,
            texts: Arr.dedupe([...profileTexts, ...(params.texts ?? [])]),
            addresses: Arr.map(Arr.dedupe(["eth", "btc", ...(params.coins ?? [])]), toCoinInput),
            contentHash: true,
          }),
        ),
        // The avatar is extra: an unreachable NFT or IPFS gateway should not fail the profile.
        runEns(Actions.record.getAvatar(ens.client, { name })).pipe(
          Effect.tapError((error) => Effect.logDebug("Avatar lookup failed", error)),
          Effect.option,
        ),
      ],
      { concurrency: "unbounded" },
    );

    return {
      name,
      resolver: records.resolver,
      texts: Rec.map(Rec.getSomes(Rec.map(records.texts, Option.fromNullishOr)), cleanRecordText),
      addresses: Rec.getSomes(Rec.map(records.addresses, Option.fromNullishOr)),
      ...(records.contentHash === null
        ? {}
        : {
            contentHash: { protocol: records.contentHash.protocol, uri: records.contentHash.uri },
          }),
      // The URL comes from the owner's record or NFT metadata: a long `data:` image is left out
      // rather than cut into an unusable URL.
      ...Option.match(
        Option.filter(Option.flatMap(avatarUrl, Option.fromNullishOr), (url) => url.length <= 2000),
        { onNone: () => ({}), onSome: (url) => ({ avatarUrl: cleanRecordText(url) }) },
      ),
    };
  });
