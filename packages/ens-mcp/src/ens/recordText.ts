import { String as Str } from "effect";

/** Longest record value returned to the model; longer values are cut. */
const maxLength = 2000;

// C0 and C1 control characters other than tab and newline, and the bidirectional overrides and
// isolates that can make text read differently from what it says. Zero-width joiners stay: emoji
// sequences need them.
// oxlint-disable-next-line no-control-regex -- matching control characters is the point
const unsafeCharacters = /[\u0000-\u0008\u000B-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g;

/**
 * Makes a record value set by a name's owner safe to show to a model: strips characters that hide
 * or reorder text, and cuts very long values with a visible marker.
 */
export const cleanRecordText = (value: string): string => {
  const clean = Str.replaceAll(unsafeCharacters, "")(value);
  return clean.length <= maxLength ? clean : `${Str.slice(0, maxLength)(clean)}… [truncated]`;
};
