import { Context } from "effect";
import { Tool } from "effect/ai";

/**
 * Hints for a tool that only reads ENS from the chain: clients can run it without asking. Strict
 * parameters turn a misspelled argument into an error the model sees, instead of ignoring it.
 */
export const ReadsEns = Context.empty().pipe(
  Context.add(Tool.Readonly, true),
  Context.add(Tool.Destructive, false),
  Context.add(Tool.Idempotent, true),
  Context.add(Tool.OpenWorld, true),
  Context.add(Tool.Strict, true),
);

/** Hints for a tool that only computes, without the network. */
export const Computes = ReadsEns.pipe(Context.add(Tool.OpenWorld, false));
