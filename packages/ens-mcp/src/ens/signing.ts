import { Array as Arr } from "effect";

/** One step as the signing guide describes it. */
export type SigningStep = {
  readonly step: number;
  readonly calls: number;
  /** Seconds to wait after the previous step confirms. */
  readonly waitSeconds?: bigint | undefined;
};

const calls = (count: number) =>
  `${count} call${count === 1 ? "" : "s"}${count > 1 ? ", in order" : ""}`;

/**
 * Plain-language signing instructions for a prepared write, e.g. "Sign step 1 (2 calls, in order)
 * from 0x… on mainnet. Wait at least 61 seconds after it confirms, then sign step 2 (2 calls, in
 * order) within 1 day of step 1, or start again."
 */
export const signingGuide = (options: {
  readonly account: string;
  readonly chain: string;
  readonly steps: ReadonlyArray<SigningStep>;
  /** Most time allowed between the first and the last step, e.g. a registration commitment. */
  readonly within?: string | undefined;
}): string => {
  const [first, ...rest] = options.steps;
  if (first === undefined) return "There is nothing to sign.";

  const later = Arr.map(rest, (step, index) => {
    const sign = `sign step ${step.step} (${calls(step.calls)})`;
    const deadline =
      options.within !== undefined && index === rest.length - 1
        ? ` within ${options.within} of step 1, or start again`
        : "";
    return step.waitSeconds === undefined
      ? `Once step ${step.step - 1} confirms, ${sign}${deadline}.`
      : `Wait at least ${step.waitSeconds} seconds after step ${step.step - 1} confirms, then ${sign}${deadline}.`;
  });
  return Arr.join(
    [
      `Sign step ${first.step} (${calls(first.calls)}) from ${options.account} on ${options.chain}.`,
      ...later,
    ],
    " ",
  );
};
