import { Effect, Result, Schema } from "effect";
import { Tool } from "effect/ai";

import { Actions, CoinType } from "@ensforge/sdk/effect";

import type { Ens } from "../../ens/Ens.js";
import { EnsToolError, runEns, tryEns } from "../../ens/errors.js";
import { Coin } from "../../schemas/Coin.js";
import { Name, Names } from "../../schemas/Name.js";

const Resolved = Schema.Struct({
  name: Name,
  /** `null` when the name has no address for the coin. */
  address: Schema.NullOr(Schema.String),
});

const Failed = Schema.Struct({ name: Name, error: EnsToolError });

/** Resolves ENS names to addresses. */
export const ResolveName = Tool.make("resolve_name", {
  description:
    "Resolve ENS names to addresses, e.g. 'What address is vitalik.eth?'. Takes up to 50 names and " +
    "returns each name's address for one coin (ETH by default, or another chain or currency such " +
    "as btc, base or sol). A name without an address for the coin returns null.",
  parameters: Schema.Struct({
    names: Names,
    coin: Schema.optionalKey(Coin),
  }),
  success: Schema.Struct({
    coin: Coin,
    results: Schema.Array(Schema.Union([Resolved, Failed])),
  }),
  failure: EnsToolError,
  failureMode: "return",
})
  .annotate(Tool.Title, "Resolve ENS names")
  .annotate(Tool.Readonly, true)
  .annotate(Tool.Destructive, false)
  .annotate(Tool.Idempotent, true)
  .annotate(Tool.OpenWorld, true);

/** Handles `resolve_name` with the server's ENS client. */
export const resolveName = (ens: Ens["Service"]) =>
  Effect.fn("resolve_name")(function* (params: typeof ResolveName.parametersSchema.Type) {
    const coinInput = params.coin ?? "eth";
    // Digits are a coin type; anything else is a symbol.
    const coin = yield* tryEns(() =>
      CoinType.from(/^\d+$/.test(coinInput) ? BigInt(coinInput) : coinInput),
    );

    // Concurrent reads share one multicall (ensforge batches them); a bad name fails only its item.
    const results = yield* Effect.forEach(
      params.names,
      (name) =>
        runEns(Actions.record.getAddress(ens.client, { name, coin })).pipe(
          Effect.result,
          Effect.map((result) =>
            Result.isSuccess(result)
              ? { name, address: result.success }
              : { name, error: result.failure },
          ),
        ),
      { concurrency: "unbounded" },
    );

    return { coin: coinInput, results };
  });
