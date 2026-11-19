import { Array as Arr, Effect, Schema } from "effect";
import { McpServer } from "effect/ai";

import { CoinType } from "@ensforge/sdk/effect";

const texts = [
  {
    key: "avatar",
    meaning: "Avatar: an https, ipfs or data URL, or an NFT (eip155:1/erc721:0x…/1)",
  },
  { key: "header", meaning: "Banner image, in the same formats as avatar" },
  { key: "display", meaning: "The name as its owner wants it shown, differing only in case" },
  { key: "description", meaning: "A short bio or description" },
  { key: "url", meaning: "Website" },
  { key: "email", meaning: "Email address" },
  { key: "location", meaning: "Where the owner is, e.g. Berlin" },
  { key: "keywords", meaning: "Comma-separated keywords" },
  { key: "notice", meaning: "A notice about the name" },
  { key: "phone", meaning: "Phone number, E.164" },
  { key: "mail", meaning: "Postal address" },
  { key: "com.twitter", meaning: "X (Twitter) username" },
  { key: "com.github", meaning: "GitHub username" },
  { key: "com.discord", meaning: "Discord username" },
  { key: "org.telegram", meaning: "Telegram username" },
  { key: "com.reddit", meaning: "Reddit username" },
  { key: "com.linkedin", meaning: "LinkedIn profile" },
  { key: "xyz.farcaster", meaning: "Farcaster username" },
  { key: "pronouns", meaning: "Pronouns (ENSIP-18)" },
  { key: "timezone", meaning: "IANA time zone, e.g. Europe/Berlin (ENSIP-18)" },
  { key: "language", meaning: "Preferred language, ISO 639-1 (ENSIP-18)" },
  { key: "primary-contact", meaning: "Which text record to contact the owner by (ENSIP-18)" },
];

// Symbols ensforge converts to coin types (ENSIP-9) and EVM chains (ENSIP-11).
const coins = [
  "eth",
  "btc",
  "sol",
  "ltc",
  "doge",
  "xrp",
  "ada",
  "dot",
  "atom",
  "trx",
  "base",
  "op",
  "arb1",
  "matic",
  "linea",
  "zora",
  "celo",
  "gno",
  "avaxc",
  "bsc",
  "default",
];

const contentHashes = [
  {
    protocol: "ipfs",
    example: "ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  },
  {
    protocol: "ipns",
    example: "ipns://k51qzi5uqu5dlvj2baxnqndepeb86cbk3ng7n3i46uzyxzyqj2xjonzllnv0v8",
  },
  {
    protocol: "bzz",
    example: "bzz://d1de9994b4d039f6548d191eb26786769f580809256b4685ef316805265ea162",
  },
  { protocol: "ar", example: "ar://HGa8i2HTjoUtyCDOZy2iFJqVCYvBLr1NTXlWsW9AuBc" },
  {
    protocol: "onion3",
    example: "onion3://p53lf57qovyuvwsc6xnrppyply3vtqm7l6pcobkmyqsiofyeznfu5uqd",
  },
  { protocol: "sia", example: "sia://CABAB_1Dlf8ZzKgALDuYeNKlPrXEZE8zSPOm7RRF9cdUWg" },
];

/** The standard text record keys, the coins addresses can be set for, and content hash formats. */
export const RecordsResource = McpServer.resource({
  uri: "ens://records",
  name: "ENS record keys",
  description:
    "Standard text record keys (ENSIP-5, ENSIP-18), coins and chains with their coin types " +
    "(ENSIP-9, ENSIP-11; default is the address for every EVM chain) and content hash formats",
  mimeType: "application/json",
  content: Effect.orDie(
    Schema.encodeEffect(Schema.fromJsonString(Schema.Unknown))({
      texts,
      coins: Arr.map(coins, (symbol) => {
        const coinType = CoinType.from(symbol);
        return {
          symbol,
          coinType: coinType.toString(),
          chainId: CoinType.toChainId(coinType),
        };
      }),
      contentHashes,
    }),
  ),
});
