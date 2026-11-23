import { Array as Arr, Record as Rec } from "effect";

import { Errors } from "@ensforge/sdk/effect";

import { hints } from "../../ens/hints.js";

/** What kind of problem an error code reports. */
export type ErrorCategory =
  | "input"
  | "name"
  | "record"
  | "permission"
  | "registration"
  | "funds"
  | "migration"
  | "dns"
  | "plan"
  | "transaction"
  | "wallet"
  | "network"
  | "indexer"
  | "gateway"
  | "config"
  | "internal";

// Typed against ensforge's codes, so a code it adds or drops fails the build until listed here.
const categories = {
  INVALID_NAME: "input",
  INVALID_ADDRESS: "input",
  INVALID_COIN_TYPE: "input",
  INVALID_CONTENT_HASH: "input",
  INVALID_RECORD_VALUE: "input",
  INVALID_DURATION: "input",
  INVALID_EXPIRY: "input",
  INVALID_ROLES: "input",
  NAME_EXPIRED: "name",
  NAME_EXTERNAL: "name",
  NAME_LOCKED: "name",
  NAME_HAS_SUBNAMES: "name",
  NAME_NOT_AVAILABLE: "name",
  NAME_NOT_REGISTERED: "name",
  NAME_NOT_RENEWABLE: "name",
  NAME_NOT_WRAPPED: "name",
  NAME_RESERVED: "name",
  NAME_UNREACHABLE: "name",
  NAME_WRAPPED: "name",
  REGISTRY_NOT_EMANCIPATED: "name",
  REGISTRY_NOT_FOUND: "name",
  SUBREGISTRY_EXISTS: "name",
  UNSUPPORTED_PROTOCOL: "name",
  UPGRADE_NOT_APPROVED: "name",
  RECORD_NOT_FOUND: "record",
  RESOLVER_NOT_FOUND: "record",
  RESOLVER_NOT_DEPLOYED: "record",
  RESOLVER_PROFILE_UNSUPPORTED: "record",
  PRIMARY_NAME_MISMATCH: "record",
  PRIMARY_NAME_NOT_SET: "record",
  NOT_OWNER: "permission",
  NOT_APPROVED: "permission",
  MISSING_ROLES: "permission",
  CANNOT_GRANT_ROLES: "permission",
  FUSE_BURNED: "permission",
  TRANSFER_DISALLOWED: "permission",
  DURATION_TOO_SHORT: "registration",
  NAME_ALREADY_RENEWED: "registration",
  PAYMENT_TOKEN_UNSUPPORTED: "registration",
  COMMITMENT_EXISTS: "registration",
  COMMITMENT_NOT_FOUND: "registration",
  COMMITMENT_TOO_NEW: "registration",
  COMMITMENT_TOO_OLD: "registration",
  INSUFFICIENT_ETH: "funds",
  INSUFFICIENT_TOKEN_BALANCE: "funds",
  ALREADY_MIGRATED: "migration",
  NAME_NOT_LOCKED: "migration",
  NAME_REQUIRES_MIGRATION: "migration",
  NOT_ELIGIBLE: "migration",
  PARENT_NOT_MIGRATED: "migration",
  RECORDS_UNKNOWN: "migration",
  VERIFICATION_FAILED: "migration",
  DNSSEC_PROOF_FAILED: "dns",
  DNS_RECORD_MISSING: "dns",
  PROOF_STALE: "dns",
  TLD_NOT_PUBLIC: "dns",
  PLAN_ACCOUNT_MISMATCH: "plan",
  PLAN_CHAIN_MISMATCH: "plan",
  PLAN_INVALID: "plan",
  PLAN_NOT_FOUND: "plan",
  PLAN_ROUTE_REQUIRED: "plan",
  PLAN_STALE: "plan",
  CONTRACT_REVERTED: "transaction",
  TRANSACTION_REVERTED: "transaction",
  RECEIPT_TIMEOUT: "transaction",
  NONCE_CONFLICT: "transaction",
  SALT_TAKEN: "transaction",
  ACCOUNT_NOT_FOUND: "wallet",
  CHAIN_MISMATCH: "wallet",
  SIGNATURE_EXPIRED: "wallet",
  SIGNATURE_INVALID: "wallet",
  USER_REJECTED: "wallet",
  WALLET_BATCH_UNSUPPORTED: "wallet",
  WALLET_NOT_CONFIGURED: "wallet",
  RATE_LIMITED: "network",
  RPC_REQUEST_FAILED: "network",
  RPC_TIMEOUT: "network",
  LOG_RANGE_TOO_LARGE: "network",
  INDEXER_BEHIND: "indexer",
  INDEXER_NOT_CONFIGURED: "indexer",
  INDEXER_NOT_FOUND: "indexer",
  INDEXER_RATE_LIMITED: "indexer",
  INDEXER_REQUEST_REJECTED: "indexer",
  INDEXER_RESPONSE_INVALID: "indexer",
  INDEXER_UNAVAILABLE: "indexer",
  INDEXER_UNSUPPORTED: "indexer",
  CCIP_READ_DISABLED: "gateway",
  GATEWAY_REQUEST_FAILED: "gateway",
  GATEWAY_RESPONSE_INVALID: "gateway",
  OFFCHAIN_LOOKUP_INVALID: "gateway",
  CHAIN_NOT_CONFIGURED: "config",
  CONTRACT_NOT_DEPLOYED: "config",
  INVALID_ACTION_GROUP: "config",
  INVALID_DEPLOYMENT: "config",
  UNKNOWN_CHAIN: "config",
  UNSUPPORTED_ON_DEPLOYMENT: "config",
  UNEXPECTED: "internal",
} as const satisfies Record<Errors.Code, ErrorCategory>;

/** An error with only its code, to read ensforge's copy and our hint for the code alone. */
class CodeOnly extends Errors.EnsforgeError<"CodeOnly", Errors.Code> {
  constructor(code: Errors.Code) {
    super("CodeOnly", { code, shortMessage: code });
  }
}

/** One error code: its category, what it means, what to do next and its documentation. */
export type ErrorEntry = {
  readonly code: Errors.Code;
  readonly category: ErrorCategory;
  readonly meaning: string;
  readonly hint?: string;
  readonly docsUrl: string;
};

/** Every error code the server can report, grouped by category. */
export const errorCatalog: ReadonlyArray<ErrorEntry> = Arr.map(
  Rec.toEntries(categories),
  ([code, category]) => {
    const error = new CodeOnly(code);
    const { message, action } = Errors.describe(error, { messages: hints });
    return {
      code,
      category,
      meaning: message,
      ...(action === undefined ? {} : { hint: action }),
      docsUrl: error.docsUrl,
    };
  },
);
