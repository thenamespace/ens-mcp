import { String as Str } from "effect";

/** The facts of a name the summary describes. */
export type SummaryFacts = {
  readonly name: string;
  readonly status: "available" | "registered" | "grace" | "expired" | "reserved" | "external";
  readonly ensVersion: "v1" | "v2" | "l2";
  /** Where a name outside ENS's registries lives; `null` for names in ENS. */
  readonly namespace:
    | { readonly kind: "l2"; readonly id: string; readonly chainId: number }
    | { readonly kind: "offchain"; readonly provider: string | null; readonly parent: string }
    | null;
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
  const { name, expiry, namespace } = facts;
  const l2 = namespace?.kind === "l2" ? `${namespace.id} (chain ${namespace.chainId})` : undefined;
  switch (facts.status) {
    case "available":
      return l2 === undefined
        ? `${name} is available to register.`
        : `${name} is available on ${l2}, registered there rather than through ENS.`;
    case "external": {
      const manager =
        namespace === null
          ? "a parent name's resolver"
          : namespace.kind === "l2"
            ? l2
            : (namespace.provider ?? `${namespace.parent}'s gateway`);
      return `${name} is managed outside ENS's registries, by ${manager}, and cannot be registered through ENS.`;
    }
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
  return `${name} is registered on ${l2 ?? `ENS${facts.ensVersion}`}${wrapped}${holder}, and ${ends}.`;
};
