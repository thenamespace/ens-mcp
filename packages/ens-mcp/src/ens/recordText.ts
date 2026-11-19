import { String as Str } from "effect";

/** Longest record value returned to the model; longer values are cut. */
const maxLength = 2000;

// C0 and C1 control characters other than tab and newline; bidirectional marks, overrides and
// isolates that make text read differently from what it says; and invisible characters, including
// Unicode tags, that can carry text a reader never sees. Zero-width joiners and non-joiners stay:
// emoji sequences and some scripts need them.
const unsafeCharacters =
  // oxlint-disable-next-line no-control-regex -- matching control characters is the point
  /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u061C\u200B\u200E\u200F\u202A-\u202E\u2060-\u2069\uFEFF\u{E0000}-\u{E007F}]/gu;

/**
 * Makes a record value set by a name's owner safe to show to a model: strips characters that hide
 * or reorder text, and cuts very long values with a visible marker.
 */
export const cleanRecordText = (value: string): string => {
  const clean = Str.replaceAll(unsafeCharacters, "")(value);
  if (clean.length <= maxLength) return clean;

  // Never cut between the two halves of a surrogate pair.
  const end = /[\uD800-\uDBFF]/.test(Str.slice(maxLength - 1, maxLength)(clean))
    ? maxLength - 1
    : maxLength;
  return `${Str.slice(0, end)(clean)}… [truncated]`;
};
