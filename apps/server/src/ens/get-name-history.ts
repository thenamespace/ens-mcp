import { getCoderByCoinType } from "@ensdomains/address-encoder";
import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import {
  type BaseDomainEvent,
  type BaseResolverEvent,
  type ContenthashChanged,
  createSubgraphClient,
  type ExpiryExtended,
  type FusesSet,
  type MulticoinAddrChanged,
  type NameUnwrapped,
  type NameWrapped,
  type NewOwner,
  type NewTtl,
  type RegistrationEvent,
  type ResolverEvent,
  type Transfer,
  type WrappedTransfer,
} from "@ensdomains/ensjs/subgraph";
import { decodeContentHash } from "@ensdomains/ensjs/utils";
import { type Address, type Hex, namehash } from "viem";

export type GetNameHistoryParameters = {
  /** Name to get history for */
  name: string;
};

export type NewResolver = BaseDomainEvent & {
  type: "NewResolver";
  resolver: {
    id: Hex;
    address: Address;
  };
};

type DomainEvent =
  | Transfer
  | NewOwner
  | NewResolver
  | NewTtl
  | WrappedTransfer
  | NameWrapped
  | NameUnwrapped
  | FusesSet
  | ExpiryExtended;

type SubgraphResult = {
  domain?: {
    events: DomainEvent[];
    registration?: {
      events: RegistrationEvent[];
    };
    resolver?: {
      events: ResolverEvent[];
    };
  };
};

type FlattenedEvent<TEvent extends {}> = {
  [K in keyof TEvent]: TEvent[K] extends { id: string } ? string : TEvent[K];
};

type ReturnDomainEvent = FlattenedEvent<DomainEvent>;
type ReturnRegistrationEvent = FlattenedEvent<RegistrationEvent>;
type ReturnResolverEvent = FlattenedEvent<
  | Exclude<ResolverEvent, MulticoinAddrChanged | ContenthashChanged>
  | (BaseResolverEvent & {
      type: "MulticoinAddrChanged";
      coinType: string;
      coinName: string | null;
      decoded: boolean;
      addr: string | null;
    })
  | (BaseResolverEvent & {
      type: "ContenthashChanged";
      decoded: boolean;
      contentHash: string | null;
      protocolType: string | null;
    })
>;

export type GetNameHistoryReturnType = {
  /** Array of domain events */
  domainEvents: ReturnDomainEvent[];
  /** Array of registration events */
  registrationEvents: ReturnRegistrationEvent[] | null;
  /** Array of resolver events */
  resolverEvents: ReturnResolverEvent[] | null;
} | null;

export const getNameHistory = async (
  client: ClientWithEns,
  { name }: GetNameHistoryParameters,
): Promise<GetNameHistoryReturnType> => {
  const subgraphClient = createSubgraphClient({ client });

  const query = `
    query getNameHistory($id: String!) {
      domain(id: $id) {
        events {
          id
          blockNumber
          transactionID
          type: __typename
          ... on Transfer {
            owner {
              id
            }
          }
          ... on NewOwner {
            owner {
              id
            }
          }
          ... on NewResolver {
            resolver {
              id
              address
            }
          }
          ... on NewTTL {
            ttl
          }
          ... on WrappedTransfer {
            owner {
              id
            }
          }
          ... on NameWrapped {
            fuses
            expiryDate
            owner {
              id
            }
          }
          ... on NameUnwrapped {
            owner {
              id
            }
          }
          ... on FusesSet {
            fuses
          }
          ... on ExpiryExtended {
            expiryDate
          }
        }
        registration {
          events {
            id
            blockNumber
            transactionID
            type: __typename
            ... on NameRegistered {
              registrant {
                id
              }
              expiryDate
            }
            ... on NameRenewed {
              expiryDate
            }
            ... on NameTransferred {
              newOwner {
                id
              }
            }
          }
        }
        resolver {
          events {
            id
            blockNumber
            transactionID
            type: __typename
            ... on AddrChanged {
              addr {
                id
              }
            }
            ... on MulticoinAddrChanged {
              coinType
              multiaddr: addr
            }
            ... on NameChanged {
              name
            }
            ... on AbiChanged {
              contentType
            }
            ... on PubkeyChanged {
              x
              y
            }
            ... on TextChanged {
              key
              value
            }
            ... on ContenthashChanged {
              hash
            }
            ... on InterfaceChanged {
              interfaceID
              implementer
            }
            ... on AuthorisationChanged {
              owner
              target
              isAuthorized
            }
            ... on VersionChanged {
              version
            }
          }
        }
      }
    }
  `;

  const queryVars = {
    id: namehash(name),
  };

  const result = await subgraphClient.request<SubgraphResult, typeof queryVars>(
    query,
    queryVars,
  );

  if (!result.domain) return null;

  const domainEvents = result.domain.events.map(
    (event: DomainEvent): ReturnDomainEvent => {
      switch (event.type) {
        case "NewResolver": {
          return {
            ...event,
            id: event.resolver.id,
            resolver: event.resolver.address,
          };
        }
        case "NewOwner":
        case "Transfer":
        case "WrappedTransfer":
        case "NameWrapped":
        case "NameUnwrapped": {
          return {
            ...event,
            owner: event.owner.id,
          };
        }
        default:
          return event;
      }
    },
  );

  const registrationEvents = result.domain?.registration?.events.map(
    (event: RegistrationEvent): ReturnRegistrationEvent => {
      switch (event.type) {
        case "NameRegistered": {
          return {
            ...event,
            registrant: event.registrant.id,
          };
        }
        case "NameTransferred": {
          return {
            ...event,
            newOwner: event.newOwner.id,
          };
        }
        default:
          return event;
      }
    },
  );

  const resolverEvents = result.domain?.resolver?.events.map(
    (event: ResolverEvent): ReturnResolverEvent => {
      switch (event.type) {
        case "AddrChanged": {
          return {
            ...event,
            addr: event.addr.id,
          };
        }
        case "MulticoinAddrChanged": {
          // biome-ignore lint/style/useNamingConvention: safe
          const { multiaddr, coinType, ...event_ } = event;
          let coder: ReturnType<typeof getCoderByCoinType> | undefined;
          try {
            coder = getCoderByCoinType(Number.parseInt(event.coinType, 10));
          } catch {
            coder = undefined;
          }
          if (!coder) {
            return {
              ...event_,
              addr: null,
              coinName: `Unsupported Coin Type ${coinType}`,
              coinType,
              decoded: false,
            };
          }
          const addr = coder.encode(
            new Uint8Array(Buffer.from(multiaddr.slice(2), "hex")),
          );

          if (coder.isUnknownChain) {
            return {
              ...event_,
              addr,
              coinName: coder.name,
              coinType,
              decoded: true,
            };
          }

          return {
            ...event_,
            addr,
            coinName: coder.name,
            coinType,
            decoded: true,
          };
        }
        case "ContenthashChanged": {
          const { decoded: contentHash, protocolType } = decodeContentHash(
            event.hash,
          ) || { decoded: null, protocolType: null };
          return {
            ...event,
            contentHash,
            decoded: contentHash !== null,
            protocolType,
          };
        }
        default:
          return event;
      }
    },
  );

  return {
    domainEvents,
    registrationEvents: registrationEvents || null,
    resolverEvents: resolverEvents || null,
  };
};
