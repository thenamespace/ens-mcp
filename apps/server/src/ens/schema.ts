/** biome-ignore-all assist/source/useSortedKeys: safe */
import { Schema } from "effect";

const PriceUnits = Schema.Struct({
  eth: Schema.String.annotations({
    description: "Amount in eth units",
  }),
  gwei: Schema.String.annotations({
    description: "Amount in gwei units",
  }),
  wei: Schema.String.annotations({
    description: "Amount in wei units",
  }),
});

export type PriceUnits = typeof PriceUnits.Type;

export const FormattedNamePrice = Schema.Struct({
  base: PriceUnits.annotations({
    description: "Base price of the name",
  }),
  premium: PriceUnits.annotations({
    description: "Premium price of the name",
  }),
  total: PriceUnits.annotations({
    description: "Total price of the name",
  }),
});

export type FormattedNamePrice = typeof FormattedNamePrice.Type;

export const EnsProfile = Schema.Struct({
  name: Schema.String.annotations({
    description: "The ENS name as requested.",
  }),

  normalizedName: Schema.String.annotations({
    description:
      "The ENS name normalized to lowercase with proper ENS normalization.",
  }),

  isAvailable: Schema.Boolean.annotations({
    description: "Whether the name is currently available for registration.",
  }),

  ownerAddress: Schema.String.annotations({
    description: "Address of the owner of the name",
  }),

  resolverAddress: Schema.String.annotations({
    description: "Address of the resolver contract for the name",
  }),

  isWrapped: Schema.Boolean.annotations({
    description: "Boolean indicating if the name is wrapped",
  }),

  expiry: Schema.Struct({
    timestamp: Schema.Number.annotations({
      description: "Expiry timestamp in seconds since Unix epoch.",
    }),

    isoDate: Schema.String.annotations({
      description: "Expiry date in ISO 8601 format.",
    }),

    secondsRemaining: Schema.Number.annotations({
      description: "Number of seconds remaining until expiry. 0 if expired.",
    }),

    status: Schema.Literal("active", "gracePeriod", "expired").annotations({
      description: "Current expiry status.",
    }),

    gracePeriodEndsAt: Schema.optional(
      Schema.Number.annotations({
        description: "Timestamp when grace period ends (if applicable).",
      }),
    ),
  }).annotations({
    description: "Expiry information of the name",
  }),

  addresses: Schema.Array(
    Schema.Struct({
      coinType: Schema.Number.annotations({
        description: "SLIP-44 coin type (e.g., 60 for ETH, 0 for BTC)",
      }),
      symbol: Schema.String.annotations({
        description: "Human-readable symbol like ETH, BTC, etc.",
      }),
      value: Schema.String.annotations({
        description: "Resolved address for the coin type.",
      }),
    }),
  ).annotations({
    description: "Address Records associated with the name",
  }),

  contentHash: Schema.optional(
    Schema.Struct({
      protocol: Schema.String.annotations({
        description: "Protocol of the content hash (e.g., ipfs, ipns, sia).",
      }),
      decoded: Schema.String.annotations({
        description: "Decoded content hash value.",
      }),
    }).annotations({
      description: "The content hash of the name",
    }),
  ),

  records: Schema.Array(
    Schema.Struct({
      key: Schema.String.annotations({
        description: "Text record key (e.g., email, url, avatar, com.twitter).",
      }),
      value: Schema.String.annotations({
        description: "Value of the text record.",
      }),
    }),
  ).annotations({
    description: "Text Records associated with the name",
  }),
});

export type EnsProfile = typeof EnsProfile.Type;

export const GetEnsProfileParams = Schema.Struct({
  name: Schema.String.annotations({
    description: "ENS name to fetch profile information for.",
  }),
  contentHash: Schema.optional(Schema.Boolean).annotations({
    description: "Include content hash information. Defaults to false.",
  }),
  textRecords: Schema.optionalWith(Schema.Array(Schema.String), {
    default: () => [],
  }).annotations({
    description:
      "Specific ENS text record keys to retrieve (e.g., email, url avatar, com.twitter).",
  }),
  coinRecords: Schema.optionalWith(
    Schema.Array(Schema.Union(Schema.String, Schema.Number)),
    { default: () => [] },
  ).annotations({
    description:
      "Specific ENS coin record keys to retrieve, supports both Symbols (ETH,BTC.SOL) and Coin Types (60,0).",
  }),
});

export type GetEnsProfileParams = typeof GetEnsProfileParams.Type;
