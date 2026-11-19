import { Schema } from "effect";
import { Tool } from "effect/ai";

import { EnsToolError } from "../../../ens/errors.js";
import { Address, AddressOrName } from "../../../schemas/Address.js";
import { ListedName, ListPage, ListParams, Namespace } from "../../../schemas/List.js";
import { Name } from "../../../schemas/Name.js";
import { ReadsEns } from "../../annotations.js";

const Relation = Schema.Literals(["owner", "manager", "roleHolder", "resolvesTo", "formerOwner"]);

/** Lists the names an address holds or that point to it. */
export const ListNamesForAddress = Tool.make("list_names_for_address", {
  description:
    "List the ENS names of an address, e.g. 'What names does nick.eth own?'. By default lists " +
    "names the address owns, manages or holds roles on; relation: resolvesTo lists names whose " +
    "ETH address is the address, formerOwner names it used to own. Each name says how the " +
    "address relates to it and whether it is the address's primary name. Set namespace to " +
    "basenames for *.base.eth names. Results come from an indexer and can lag the chain by a few " +
    "blocks.",
  parameters: Schema.Struct({
    address: AddressOrName,
    relation: Schema.optionalKey(Schema.Literals(["any", ...Relation.literals])).annotate({
      description:
        "any (default: owner, manager or role holder), owner, manager, roleHolder, resolvesTo or " +
        "formerOwner",
    }),
    parent: Schema.optionalKey(Name).annotate({
      description: "Only direct subnames of this name, e.g. base.eth",
    }),
    search: Schema.optionalKey(Schema.String).annotate({
      description: "Only names whose label starts with this text",
    }),
    sort: Schema.optionalKey(Schema.Literals(["name", "expiry", "registered", "created"])),
    order: Schema.optionalKey(Schema.Literals(["asc", "desc"])),
    namespace: Schema.optionalKey(Namespace),
    ...ListParams,
  }),
  success: ListPage(
    Schema.Struct({
      ...ListedName.fields,
      relations: Schema.Array(Relation),
      isPrimary: Schema.Boolean.annotate({ description: "The address's primary name" }),
    }),
    { address: Address.annotate({ description: "The address listed, resolved from a name" }) },
  ),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "List names of an address")
  .annotateMerge(ReadsEns);
