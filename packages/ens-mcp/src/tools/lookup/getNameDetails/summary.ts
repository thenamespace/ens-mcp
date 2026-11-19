import { String as Str } from "effect";

/** The facts of a name the summary describes. */
export type SummaryFacts = {
  readonly name: string;
  readonly status: "available" | "registered" | "grace" | "expired" | "reserved";
  readonly ensVersion: "v1" | "v2";
  readonly owner: string | null;
  readonly wrapped: boolean;
  /** ISO timestamps. */
  readonly expiry: { readonly at: string; readonly daysLeft: number } | undefined;
  readonly gracePeriodEnd: string | undefined;
};

const day = (iso: string) => Str.slice(0, 10)(iso);

/**
 * One sentence a model can repeat to the user, e.g. "nick.eth is registered on ENSv2, owned by
 * 0x…, and expires on 2035-01-10 (in 3,000 days)."
 */
export const summarize = (facts: SummaryFacts): string => {
  const { name, expiry } = facts;
  switch (facts.status) {
    case "available":
      return `${name} is available to register.`;
    case "reserved":
      return `${name} is reserved on ENSv2 and cannot be registered.`;
    case "expired":
      return `${name} expired${expiry === undefined ? "" : ` on ${day(expiry.at)}`} and can be registered again.`;
    case "grace":
      return (
        `${name} expired${expiry === undefined ? "" : ` on ${day(expiry.at)}`} and is in its grace period` +
        `${facts.gracePeriodEnd === undefined ? "" : ` until ${day(facts.gracePeriodEnd)}`}: it can still be renewed, ` +
        "then anyone can register it."
      );
    case "registered":
      break;
  }

  const holder = facts.owner === null ? "" : `, owned by ${facts.owner}`;
  const wrapped = facts.wrapped ? " and wrapped in the NameWrapper" : "";
  const ends =
    expiry === undefined
      ? "does not expire"
      : `expires on ${day(expiry.at)} (in ${expiry.daysLeft.toLocaleString("en-US")} days)`;
  return `${name} is registered on ENS${facts.ensVersion}${wrapped}${holder}, and ${ends}.`;
};
