import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address } from "../../../schemas/Address.js";
import { Name } from "../../../schemas/Name.js";
import { Timestamp } from "../../../schemas/Timestamp.js";
import { ReadsEns } from "../../annotations.js";

const Details = Schema.Literals(["fuses", "migration"]);

/** Reads who controls a name and its registration state. */
export const GetNameDetails = Tool.make("get_name_details", {
  description:
    "Get an ENS name's ownership and registration state, e.g. 'Who owns ens.eth and when does " +
    "it expire?'. Returns a one-line summary, status (available, registered, grace, expired, " +
    "reserved, or external for names served by an L2 namespace or off-chain gateway), ENS " +
    "version (v1, v2 or l2), where an L2 or off-chain name lives, owner, manager and registrant, resolver, expiry and grace period, " +
    "and whether it is wrapped, can be registered or renewed. Ask for burned NameWrapper fuses " +
    "or ENSv2 migration readiness with include. To check what one account may do, use " +
    "get_permissions.",
  parameters: Schema.Struct({
    name: Name,
    include: Schema.optionalKey(Schema.Array(Details)).annotate({
      description:
        "Extra details: fuses (wrapped names), migration (moving an ENSv1 name to ENSv2)",
    }),
  }),
  success: Schema.Struct({
    name: Name,
    summary: Schema.String,
    status: Schema.Literals([
      "available",
      "registered",
      "grace",
      "expired",
      "reserved",
      "external",
    ]),
    ensVersion: Schema.Literals(["v1", "v2", "l2"]),
    namespace: Schema.optionalKey(
      Schema.Union([
        Schema.Struct({
          kind: Schema.Literal("l2"),
          id: Schema.String.annotate({ description: "e.g. basenames, linea, durin" }),
          parent: Schema.String.annotate({ description: "e.g. base.eth" }),
          chainId: Schema.Int,
          registry: Schema.NullOr(Address),
        }),
        Schema.Struct({
          kind: Schema.Literal("offchain"),
          provider: Schema.NullOr(Schema.String).annotate({ description: "e.g. Coinbase" }),
          parent: Schema.String.annotate({ description: "The name whose gateway serves it" }),
        }),
      ]),
    ).annotate({
      description:
        "Where a name outside ENS's registries lives: an L2 namespace or off-chain provider",
    }),
    owner: Schema.NullOr(Address).annotate({ description: "Who ultimately controls the name" }),
    manager: Schema.optionalKey(Address).annotate({
      description: "ENSv1 registry owner (the ENS app's manager), when the name has one",
    }),
    registrant: Schema.optionalKey(Address).annotate({
      description: "ENSv1 .eth registrar token holder, when the name has one",
    }),
    resolver: Schema.NullOr(
      Schema.Struct({
        address: Address,
        inherited: Schema.Boolean.annotate({
          description:
            "Served from a parent (wildcard or off-chain resolver) rather than set on the name",
        }),
      }),
    ),
    expiry: Schema.optionalKey(
      Schema.Struct({ at: Timestamp, daysLeft: Schema.Int }).annotate({
        description: "End of the registration, grace period excluded; absent when it never expires",
      }),
    ),
    gracePeriodEnd: Schema.optionalKey(Timestamp),
    wrapped: Schema.Boolean.annotate({ description: "Wrapped in the ENSv1 NameWrapper" }),
    migrated: Schema.Boolean.annotate({ description: "Moved from ENSv1 to ENSv2" }),
    available: Schema.Boolean.annotate({ description: "Can be registered now" }),
    renewable: Schema.Boolean.annotate({ description: "Can be renewed now" }),
    reachable: Schema.Boolean.annotate({
      description: "Whether ENS resolution still reaches the name's records",
    }),
    fuses: Schema.optionalKey(
      Schema.NullOr(Schema.Array(Schema.String)).annotate({
        description: "Burned NameWrapper fuses; null when the name is not wrapped",
      }),
    ),
    migration: Schema.optionalKey(
      Schema.Struct({
        status: Schema.Literals(["eligible", "blocked", "migrated", "not-required"]),
        route: Schema.NullOr(Schema.String),
        blockers: Schema.Array(Schema.String),
      }),
    ),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Get ENS name details")
  .annotateMerge(ReadsEns);
