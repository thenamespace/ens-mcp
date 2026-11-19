# Prepared writes

Write tools never sign or send. Each one asks ensforge to plan and simulate the change for the
signing `account`, and returns:

- `summary`: what the plan does, in one line.
- `willSucceed` and `issues`: whether the steps that can be checked now would succeed, and why not,
  with a hint per issue.
- `requirements`: what the account needs, such as a USDC balance.
- `warnings`, `cost` (ETH sent and estimated gas) and `deploys` (contracts the plan creates).
- `steps`: transactions grouped by signature, with the wait before each and whether it could be
  checked now or only after earlier steps confirm.
- `signing`: how to sign, in plain words.
- `calls`: the unsigned calls (`to`, `data`, `value`, `chainId`) for the user's wallet.
- `plan`: a handle (`ensplan1.…`) that carries the whole plan.

## Presenting a plan

1. Say what will happen (`summary`), and whether it would succeed. If not, explain the issues and
   the fix before anything else.
2. List the requirements and the cost.
3. Give the signing steps. Mention waits between steps.
4. Give the calls for the user's wallet, or keep them for when the user asks.
5. Keep the plan handle.

`account` and address parameters accept ENS names; the result shows the address they resolved to,
which the user should check.

## After the user signs

Call `get_plan_status` with the plan handle and the hash of each transaction sent, with its step.
It reports each step (`confirmed`, `pending`, `reverted`, `waiting`, `ready`, `blocked`), the
registration commitment's window, whether the next step would succeed now, and `next`: what the user
should do. Once `done` is true it names the read tool that shows the result.

`get_plan` shows a plan again from its handle; with `check: true` it re-simulates it against the
current chain.

## When things fail

- `willSucceed: false`: do not ask the user to sign; fix the issue first (wrong account, missing
  balance, missing permission).
- A reverted step: `get_plan_status` re-checks it to explain why; prepare the write again.
- A plan for another chain fails with `PLAN_CHAIN_MISMATCH`.
