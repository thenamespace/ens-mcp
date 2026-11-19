# ens-mcp repository guide

ens-mcp is a [Model Context Protocol](https://modelcontextprotocol.io) server that connects AI
assistants to ENS (Ethereum Name Service). It is a pnpm and Turborepo monorepo, written with
Effect, and published to npm as `@thenamespace/ens-mcp`.

## Workspace map

- `packages/*`: publishable packages, starting with `@thenamespace/ens-mcp`.
- `apps/*`: runnable applications, when one is introduced.
- `tests/*`: every test suite; unit tests in `tests/unit/<package>`.
- `tools/cli`: `ens-mcp-dev`, the repository's build and check commands, written with Effect.
- `.config/`: lint, format, test, turbo and commit configuration.

## Commands

- `pnpm check`: formatting, linting, type checking, builds and tests.
- `pnpm format`: format the workspace with Oxfmt.
- `pnpm changeset`: record a publishable package change.

Use the Klarity presets already configured at the workspace root. Packages build with TypeScript 7's
`tsc` (`ens-mcp-dev build`, from `tools/cli`). Do not add Prettier, ESLint, Husky, lint-staged,
tsup, or Rollup unless a demonstrated requirement cannot be met by the existing tools. Pin every
external dependency in the pnpm catalog (`pnpm-workspace.yaml`). Tool configs live in `.config/`.

`tsc` is patched with the Effect language service (`@effect/tsgo`), so typecheck reports Effect
diagnostics. Fix them in the code rather than silencing them; disable one with an
`@effect-diagnostics-next-line` comment only when the flagged pattern is the point of the code.
`pnpm install` also patches oxlint (`effect-tsgo patch --oxlint`): lint is type-aware and runs the
`@effect/tsgo` oxlint presets, whose rules `tsc` does not run. Silence those the same way, with a
one-line reason and `// oxlint-disable-next-line effecttsgo/<rule>`. Unstable and experimental
APIs used on purpose are allowlisted per package (`allowedUnstableApis`, `allowedExperimentalApis`
in its tsconfig).

## Code guidelines

Oxfmt does not insert logical blank lines; review grouping explicitly when writing code.

### Structure and naming

- Name things for what they are in the domain, consistently across the repository: one name per
  concept, not synonyms per file.
- Prefer Effect services (`Context.Service` with a static `layer`, methods built with
  `Effect.fn`/`Effect.fnUntraced`) over free functions that take a client as their first argument.
- Use what exists before writing a helper: viem, Effect (`Predicate`, `Schema`, `Array`, …), then
  the package's own modules. When a helper is missing and generally useful, add it to the module
  that owns the concept, with tests.
- Keep each MCP tool in its own module, following neighboring tools. Keep each file to one
  responsibility.

### Helpers and inlining

- Inline one-off logic at its use site. Do not declare small helpers, constants or fixtures at the
  top of a file when they are used once or twice in that file.
- Extract only substantial logic, or logic reused across files, into a shared module with a
  specific name; never into catch-all `utils`/`helpers` files.
- Inline trivial wrappers: a function that only constructs an error or forwards a call adds
  navigation without clarifying intent.
- Preserve existing public APIs when cleaning up.

### Grouping and comments

- Separate logical blocks with a blank line: setup, validation, execution (RPC or HTTP work),
  state updates, assertions and result construction. Keep short, related declarations together.
- Use brief comments for non-obvious constraints, ordering or lifecycle decisions. Avoid comments
  that repeat the code and section banners.

## Tools

- One folder per tool under its toolset, `src/tools/<toolset>/<tool>/`: `tool.ts` defines what
  clients see (`Tool.make` with Schema parameters and results, title, `ReadsEns` or `Computes`
  hints, `failure: EnsToolError`, `failureMode: "return"`); `handler.ts` implements it with an
  explicit `Effect.fn.Return`. The toolset's `index.ts` builds the toolkit layer.
- Reuse the schemas in `src/schemas/` for parameters and results; add a schema there when a second
  tool needs it.
- Descriptions, in order: what it answers, an example question, when another tool fits better,
  what comes back, and notes (indexer lag, record values set by the name's owner).
- Call ensforge through `runEns` (retries, `EnsToolError`); batch items fail with `ItemError`
  without failing the call. Missing records are `null`, not errors.
- Clean record text set by name owners with `cleanRecordText`.
- Write tools never send: they call `prepareWrite` with the ensforge action, which simulates it and
  returns a `PreparedWrite` (summary, issues, requirements, cost, steps, signing, calls, plan
  handle). `account` and other address parameters accept ENS names (`resolveAccount`).
- When a tool is added, update the toolset's line in `src/server/instructions.ts` and the README.

## Tests

- All tests live under `tests/`, run through `@effect/vitest` only; do not import `vitest`
  directly.
- Tests are Effect programs (`it.effect`, `layer(...)`). Do not write `Effect.promise`/`async` in
  tests except to wrap non-Effect libraries.
- Write the tests a behaviour needs: the documented contract, its failure cases and regressions.
  Do not add tests that restate the implementation or check what the type checker already proves.

# Learning more about Effect

This repository uses the Effect TypeScript library.

Before writing any Effect code, first read `node_modules/effect/AGENTS.md` **completely**, and follow
the links in the file when required.

If you need to learn more about particular Effect APIs and concepts that the guide does not cover,
search through the source code in `node_modules/effect/src`.
