import { Effect, Result } from "effect";

import { Name } from "@ensforge/sdk/effect";

import { tryEns, type EnsToolError } from "../../../ens/errors.js";
import type { NormalizeName } from "./tool.js";

/** Handles `normalize_name`. */
export const normalizeName = Effect.fn("normalize_name")(function* (
  params: typeof NormalizeName.parametersSchema.Type,
): Effect.fn.Return<typeof NormalizeName.successSchema.Type, EnsToolError> {
  const results = yield* Effect.forEach(
    params.names,
    (input) =>
      tryEns(() => {
        const normalized = Name.normalize(input);
        const { labels, label, parent } = Name.parse(normalized);
        return {
          input,
          normalized,
          labels,
          parent,
          namehash: Name.namehash(normalized),
          labelhash: Name.labelhash(label),
        };
      }).pipe(
        Effect.result,
        Effect.map((result) =>
          Result.isSuccess(result) ? result.success : { input, error: result.failure },
        ),
      ),
    { concurrency: "unbounded" },
  );

  return { results };
});
