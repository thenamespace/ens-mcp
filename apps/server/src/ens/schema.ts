/** biome-ignore-all assist/source/useSortedKeys: safe */
import { Schema } from "effect";

const PriceUnits = Schema.Struct({
  eth: Schema.String.annotate({
    description: "Amount in eth units",
  }),
  gwei: Schema.String.annotate({
    description: "Amount in gwei units",
  }),
  wei: Schema.String.annotate({
    description: "Amount in wei units",
  }),
});

export type PriceUnits = typeof PriceUnits.Type;

export const FormattedNamePrice = Schema.Struct({
  base: PriceUnits.annotate({
    description: "Base price of the name",
  }),
  premium: PriceUnits.annotate({
    description: "Premium price of the name",
  }),
  total: PriceUnits.annotate({
    description: "Total price of the name",
  }),
});

export type FormattedNamePrice = typeof FormattedNamePrice.Type;

export const EnsProfile = Schema.Struct({
  name: Schema.String.annotate({
    description: "The ENS name as requested.",
  }),

  normalizedName: Schema.String.annotate({
    description:
      "The ENS name normalized to lowercase with proper ENS normalization.",
  }),

  ownerAddress: Schema.String.annotate({
    description: "Address of the owner of the name",
  }),

  resolverAddress: Schema.NullOr(Schema.String).annotate({
    description: "Address of the resolver contract for the name",
  }),

  isWrapped: Schema.Boolean.annotate({
    description: "Boolean indicating if the name is wrapped",
  }),

  expiry: Schema.NullOr(
    Schema.Struct({
      timestamp: Schema.Number.annotate({
        description: "Expiry timestamp in seconds since Unix epoch.",
      }),

      isoDate: Schema.String.annotate({
        description: "Expiry date in ISO 8601 format.",
      }),

      secondsRemaining: Schema.Number.annotate({
        description: "Number of seconds remaining until expiry. 0 if expired.",
      }),

      status: Schema.Literals(["active", "gracePeriod", "expired"]).annotate({
        description: "Current expiry status.",
      }),

      gracePeriodEndsAt: Schema.optional(
        Schema.Number.annotate({
          description:
            "Timestamp in seconds when grace period ends (if applicable).",
        }),
      ),

      gracePeriodEndsAtIso: Schema.optional(
        Schema.String.annotate({
          description:
            "Timestamp in ISO 8601 format when grace period ends (if applicable).",
        }),
      ),
    }),
  ).annotate({
    description: "Expiry information of the name",
  }),

  addresses: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        coinType: Schema.Number.annotate({
          description: "SLIP-44 coin type (e.g., 60 for ETH, 0 for BTC)",
        }),
        symbol: Schema.String.annotate({
          description: "Human-readable symbol like ETH, BTC, etc.",
        }),
        value: Schema.String.annotate({
          description: "Resolved address for the coin type.",
        }),
      }),
    ),
  ).annotate({
    description: "Address Records associated with the name",
  }),

  contentHash: Schema.optional(
    Schema.Struct({
      protocolType: Schema.NullOr(Schema.String).annotate({
        description: "Protocol of the content hash (e.g., ipfs, ipns, sia).",
      }),
      decoded: Schema.String.annotate({
        description: "Decoded content hash value.",
      }),
    }).annotate({
      description: "The content hash of the name",
    }),
  ),

  records: Schema.mutable(
    Schema.Array(
      Schema.Struct({
        key: Schema.String.annotate({
          description:
            "Text record key (e.g., email, url, avatar, com.twitter).",
        }),
        value: Schema.String.annotate({
          description: "Value of the text record.",
        }),
      }),
    ),
  ).annotate({
    description: "Text Records associated with the name",
  }),
});

export type EnsProfile = typeof EnsProfile.Type;

export const GetEnsProfileParams = Schema.Struct({
  name: Schema.String.annotate({
    description: "ENS name to fetch profile information for.",
  }),
  contentHash: Schema.optional(Schema.Boolean).annotate({
    description: "Include content hash information. Defaults to false.",
  }),
  textRecords: Schema.optional(Schema.Array(Schema.String)).annotate({
    description:
      "Specific ENS text record keys to retrieve (e.g., email, url avatar, com.twitter).",
  }),
  coinRecords: Schema.optional(
    Schema.Array(Schema.Union([Schema.String, Schema.Number])),
  ).annotate({
    description:
      "Specific ENS coin record keys to retrieve, supports both Symbols (ETH,BTC.SOL) and Coin Types (60,0).",
  }),
});

export type GetEnsProfileParams = typeof GetEnsProfileParams.Type;
export const GenericName = Schema.Struct({
  name: Schema.String.annotate({
    description: "Name string",
  }),
  creation: Schema.Struct({
    isoDate: Schema.String.annotate({
      description: "Initial name creation time in ISO 8601 format",
    }),
    timestamp: Schema.Number.annotate({
      description: "Initial name creation time in seconds since Unix epoch",
    }),
  }),
  registration: Schema.Struct({
    isoDate: Schema.String.annotate({
      description: "Registration date of name in ISO 8601 format",
    }),
    timestamp: Schema.Number.annotate({
      description: "Registration date of name in seconds since Unix epoch",
    }),
  }),
  expiry: Schema.Struct({
    isoDate: Schema.String.annotate({
      description: "Expiry date of name in ISO 8601 format",
    }),
    timestamp: Schema.Number.annotate({
      description: "Expiry date of name in seconds since Unix epoch",
    }),
    secondsRemaining: Schema.Number.annotate({
      description: "Seconds remaining until expiry. 0 if expired.",
    }),
  }),
  ownerAddress: Schema.String.annotate({
    description: "Current owner address of the subname",
  }),
  resolverAddress: Schema.String.annotate({
    description: "Resolver contract address",
  }),
  isWrapped: Schema.Boolean.annotate({
    description: "Whether the name is wrapped using ENS NameWrapper",
  }),
});

export type GenericName = typeof GenericName.Type;

export const OrderOptions = {
  orderBy: Schema.optional(
    Schema.Literals(["expiryDate", "name", "labelName", "createdAt"]),
  ).annotate({
    description: "Parameter to order names by (default: name)",
  }),
  orderDirection: Schema.optional(Schema.Literals(["asc", "desc"])).annotate({
    description: "Direction to order names in (default: asc)",
  }),
  pageSize: Schema.optional(Schema.Number).annotate({
    description: "Page size (default: 100)",
  }),
};

export const GetSubnamesForNameParams = Schema.Struct({
  name: Schema.String.annotate({
    description: "Name to get subnames for",
  }),
  searchString: Schema.optional(Schema.String).annotate({
    description: "Filter subnames by label substring match. Case-insensitive.",
  }),
  allowExpired: Schema.optional(Schema.Boolean).annotate({
    description:
      "Include expired subnames in the results. Defaults to false (only active names returned).",
  }),
  allowDeleted: Schema.optional(Schema.Boolean).annotate({
    description: "Include deleted subnames in the results. Defaults to false.",
  }),
  // TODO: See how to add pagination, current ensjs uses prevNames, which is not ideal
  ...OrderOptions,
});

export type GetSubnamesForNameParams = typeof GetSubnamesForNameParams.Type;

export const GetSubnamesForNameResponse = Schema.Struct({
  subnames: Schema.Array(GenericName),
});
export type GetSubnamesForNameResponse = typeof GetSubnamesForNameResponse.Type;

export const GetNamesForAddressParams = Schema.Struct({
  address: Schema.String.annotate({
    description: "Address to get names for",
  }),
  filter: Schema.optional(
    Schema.Struct({
      searchString: Schema.optional(Schema.String).annotate({
        description: "Filter names by substring match. Case-insensitive.",
      }),
      searchType: Schema.optional(
        Schema.Literals(["labelName", "name"]),
      ).annotate({
        description: "Search names by type (default: name)",
      }),
      allowExpired: Schema.optional(Schema.Boolean).annotate({
        description:
          "Include expired names in the results. Defaults to false (only active names returned).",
      }),
      allowDeleted: Schema.optional(Schema.Boolean).annotate({
        description: "Include deleted names in the results. Defaults to false.",
      }),
    }),
  ),
  ...OrderOptions,
});

export type GetNamesForAddressParams = typeof GetNamesForAddressParams.Type;

export const GetNamesForAddressResponse = Schema.Struct({
  names: Schema.Array(GenericName),
});

export type GetNamesForAddressResponse = typeof GetNamesForAddressResponse.Type;
export const GetNameHistoryParams = Schema.Struct({
  name: Schema.String.annotate({
    description: "ENS name to get history for",
  }),
});

export type GetNameHistoryParams = typeof GetNameHistoryParams.Type;

export const GenericEvent = Schema.Struct({
  eventType: Schema.String.annotate({
    description: "Type of event",
  }),
  txHash: Schema.String.annotate({
    description: "Transaction hash of the event",
  }),
  blockNumber: Schema.Number.annotate({
    description: "Block number of the event",
  }),
  data: Schema.Record(Schema.String, Schema.Any).annotate({
    description: "Event data",
  }),
});

export type GenericEvent = typeof GenericEvent.Type;

export const GetNameHistoryResponse = Schema.Struct({
  events: Schema.Array(GenericEvent),
});

export type GetNameHistoryResponse = typeof GetNameHistoryResponse.Type;
