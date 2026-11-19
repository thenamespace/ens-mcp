import { Effect, Result, Schema } from "effect";
import { Tool } from "effect/ai";

import { Actions, CoinType } from "@ensforge/sdk/effect";

import { Chain } from "../../ens/Chain.js";
import type { Chains } from "../../ens/Chains.js";
import { EnsToolError, runEns, tryEns } from "../../ens/errors.js";

const Resolved = Schema.Struct({
  name: Schema.String,
  /** `null` when the name has no address for the coin. */
  address: Schema.NullOr(Schema.String),
});

const Failed = Schema.Struct({ name: Schema.String, error: EnsToolError });

/** Resolves ENS names to addresses. */
export const ResolveName = Tool.make("resolve_name", {
  description:
    "Resolve ENS names to addresses, e.g. 'What address is vitalik.eth?'. Takes up to 50 names and " +
    "returns each name's address for one coin (ETH by default, or another chain or currency such " +
    "as btc, base or sol). A name without an address for the coin returns null.",
  parameters: Schema.Struct({
    names: Schema.Array(Schema.String)
      .check(Schema.isMinLength(1), Schema.isMaxLength(50))
      .annotate({ description: "ENS names as the user wrote them, e.g. ['vitalik.eth']." }),
    coin: Schema.optional(Schema.String).annotate({
      description:
        "Coin symbol such as eth, btc, sol, base, op, or a numeric coin type (ENSIP-9/11). Default: eth.",
    }),
    chain: Schema.optional(Chain),
  }),
  success: Schema.Struct({
    coin: Schema.String,
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

/** Handles `resolve_name` with the server's chains. */
export const resolveName = (chains: Chains["Service"]) =>
  Effect.fn("resolve_name")(function* (params: typeof ResolveName.parametersSchema.Type) {
    const ens = chains.client(params.chain);
    const coinInput = params.coin ?? "eth";
    // Digits are a coin type; anything else is a symbol.
    const coin = yield* tryEns(() =>
      CoinType.from(/^\d+$/.test(coinInput) ? BigInt(coinInput) : coinInput),
    );

    // Concurrent reads share one multicall (ensforge batches them); a bad name fails only its item.
    const results = yield* Effect.forEach(
      params.names,
      (name) =>
        runEns(Actions.record.getAddress(ens, { name, coin })).pipe(
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
