import { Effect } from "effect";

import { ContentHash, Errors } from "@ensforge/sdk/effect";

import { toToolError, tryEns, type EnsToolError } from "../../../ens/errors.js";
import type { ConvertContentHash } from "./tool.js";

/** Handles `convert_content_hash`. */
export const convertContentHash = Effect.fn("convert_content_hash")(function* (
  params: typeof ConvertContentHash.parametersSchema.Type,
): Effect.fn.Return<typeof ConvertContentHash.successSchema.Type, EnsToolError> {
  const { uri } = params;
  // The parameters schema requires exactly one of `uri` and `hex`.
  if (params.hex === undefined && uri === undefined)
    return yield* Effect.die("convert_content_hash: no uri or hex");
  const hex = params.hex ?? (yield* tryEns(() => ContentHash.encode(uri ?? "")));
  const decoded = ContentHash.decode(hex);
  if (decoded === null)
    return yield* toToolError(
      new Errors.InvalidInputError({ code: "INVALID_CONTENT_HASH", input: hex }),
    );

  return {
    protocol: decoded.protocol,
    uri: decoded.uri,
    hex,
    gatewayUrl: ContentHash.toGatewayUrl(decoded.uri),
  };
});
