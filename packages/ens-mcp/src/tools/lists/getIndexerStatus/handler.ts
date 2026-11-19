import { Effect, Record as Rec } from "effect";

import { Actions } from "@ensforge/sdk/effect";

import type { Ens } from "../../../ens/Ens.js";
import { runEns, type EnsToolError } from "../../../ens/errors.js";
import type { GetIndexerStatus } from "./tool.js";

/** Handles `get_indexer_status`. */
export const getIndexerStatus = (ens: Ens["Service"]) =>
  Effect.fn("get_indexer_status")(function* (): Effect.fn.Return<
    typeof GetIndexerStatus.successSchema.Type,
    EnsToolError
  > {
    const status = yield* runEns(Actions.indexer.getStatus(ens.client, {}));

    return {
      indexer: status.indexer,
      status: status.status,
      chains: Rec.collect(status.chains, (chainId, chain) => ({
        chainId: Number(chainId),
        status: chain.status,
        indexedBlock: chain.indexed === null ? null : chain.indexed.toString(),
        latestBlock: chain.latest === null ? null : chain.latest.toString(),
        lagBlocks: chain.lagBlocks,
        lagSeconds: chain.lagSeconds,
      })),
    };
  });
