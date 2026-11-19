import { Predicate, String as Str } from "effect";

import type { IndexedEvent } from "@ensforge/sdk/indexer";
import { getAddress, isAddress } from "viem";

import { cleanRecordText } from "../../../ens/recordText.js";
import { fromUnixSeconds } from "../../../schemas/Timestamp.js";

type Data = IndexedEvent["data"];

const text = (data: Data, key: string): string | undefined => {
  const value = data?.[key];
  return Predicate.isString(value) ? value : undefined;
};

// Indexers report lowercase addresses, alone or as `{ chainId, address }`.
const address = (data: Data, key: string): string | undefined => {
  const value = data?.[key];
  const raw =
    Predicate.isObject(value) && Predicate.hasProperty(value, "address") ? value.address : value;
  return Predicate.isString(raw) && isAddress(raw) ? getAddress(raw) : undefined;
};

const day = (data: Data, key: string): string | undefined => {
  const seconds = text(data, key);
  return seconds === undefined || !/^\d+$/.test(seconds)
    ? undefined
    : Str.slice(0, 10)(fromUnixSeconds(BigInt(seconds)));
};

const optional = (prefix: string, value: string | undefined) =>
  value === undefined ? "" : `${prefix}${value}`;

/** `record_changed` → `Record changed`. */
const humanize = (action: string) => {
  const words = Str.replaceAll("_", " ")(action);
  return `${Str.toUpperCase(Str.slice(0, 1)(words))}${Str.slice(1)(words)}`;
};

/** One line describing an indexed ENS event, e.g. "Transferred from 0x… to 0x…". */
export const summarizeEvent = (event: IndexedEvent): string => {
  const { data } = event;
  switch (event.action) {
    case "registration_granted":
      return `Registered${optional(" to ", address(data, "registrant"))}${optional(", expiring ", day(data, "expiresAt"))}`;
    case "registration_renewed":
      return `Renewed${optional(" until ", day(data, "expiresAt"))}`;
    case "registration_reserved":
      return `Reserved on ENSv2${optional(" until ", day(data, "expiresAt"))}`;
    case "expiry_changed":
      return `Expiry set${optional(" to ", day(data, "expiresAt"))}`;
    case "token_transferred":
      return `Transferred${optional(" from ", address(data, "from"))}${optional(" to ", address(data, "to"))}`;
    case "authority_changed":
      return `Owner set${optional(" to ", address(data, "owner"))}`;
    case "resolver_changed":
      return `Resolver set${optional(" to ", address(data, "resolver"))}`;
    case "subregistry_changed":
      return `Subregistry set${optional(" to ", address(data, "subregistry"))}`;
    case "permission_changed":
      return `Roles changed${optional(" for ", address(data, "address"))}`;
    case "migration_applied":
      return `Moved to ENSv2${optional(" via ", text(data, "migrationPath"))}`;
    case "record_changed": {
      const value = text(data, "value");
      return `Record ${text(data, "key") ?? "changed"}${value === undefined ? " changed" : ` set to "${cleanRecordText(value)}"`}`;
    }
    default:
      return humanize(event.action ?? event.type);
  }
};
