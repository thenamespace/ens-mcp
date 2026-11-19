# Contributing to ens-mcp

Thanks for helping improve ens-mcp. Contributions to tools, transports, tests and documentation are
welcome.

## Prerequisites

- Node.js 26
- pnpm 12
- Docker, to build the server image

The repository pins its Node.js version in `.node-version` and its package manager in
`package.json`.

## Setup

Fork and clone the repository, then install dependencies and build the workspace:

```sh
pnpm install
pnpm build
```

`pnpm install` installs the git hooks (Lefthook) and patches TypeScript 7 with the
[Effect language service](https://github.com/Effect-TS/tsgo), so `tsc` reports Effect diagnostics.
In VS Code, install the recommended extensions; the workspace settings point them at the patched
compiler and the configs in `.config/`.

## Repository structure

```text
docs/       User documentation, linked from the README
packages/   Publishable packages (@thenamespace/ens-mcp)
tests/      Test suites; unit tests in tests/unit/<package>
tools/cli/  ens-mcp-dev: package builds and checks
.config/    Lint, format, test, turbo and commit configuration
.github/    Workflows, the shared setup action, issue and PR templates
```

## Development checks

Run the complete local check before opening a pull request:

```sh
pnpm check
pnpm pack:check
```

CI runs the same (`pnpm check`, then `pnpm pack:check`) and builds the Docker image.
`pnpm check` covers formatting (Oxfmt), linting (Oxlint with the Effect presets), type checking,
builds and tests. `pnpm pack:check` validates package metadata and exports.

| Command                        | Runs                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `pnpm check`                   | format check, lint, typecheck, build, tests             |
| `pnpm format`                  | format the workspace                                    |
| `pnpm lint:fix`                | apply lint fixes                                        |
| `pnpm test`                    | unit tests                                              |
| `pnpm changeset`               | record a release note for a package change              |
| `pnpm exec ens-mcp-dev tokens` | context the built server takes in a client, per toolset |

Live tests read mainnet through a real RPC and the indexer; run them with
`ENS_MCP_LIVE=1 pnpm test` (and `ENS_MCP_RPC_URL` to avoid public RPC limits).

## Tests

Tests use [`@effect/vitest`](https://github.com/Effect-TS/effect/tree/main/packages/vitest) only;
do not import `vitest` directly. `it.effect` runs Effect tests, `it.prop` / `it.effect.prop` run
property tests. Every test lives under `tests/`; unit tests never touch the network and run on
every pull request.

## Commits and pull requests

Use small [Conventional Commits](https://www.conventionalcommits.org/); commitlint checks each
commit message and the PR title (which becomes the squash commit):

```text
feat: add name availability tool
fix(http): return 202 for notifications
docs: document the stdio setup
```

A pull request should explain the behavior being changed and include appropriate tests. Avoid
unrelated refactors in the same change. Changes to `main` require one code-owner approval.

Do not add wallet keys or provider credentials to workflows. Report vulnerabilities through
[private security reporting](https://github.com/thenamespace/ens-mcp/security/advisories/new), not
public issues. See [SECURITY.md](SECURITY.md).

## Continuous integration

Workflows live in `.github/workflows`; the shared composite action `.github/actions/setup`
installs Node from `.node-version`, pnpm from `packageManager` and the frozen dependencies.

| Workflow               | Runs                                                                                              | Trigger                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `ci.yml`               | `_check.yml`: `pnpm check`, `pnpm pack:check`, the Docker image build and a zizmor audit          | pull requests, `main`, merge queue, manual |
| `pr-title.yml`         | the PR title as a Conventional Commit with commitlint's types                                     | pull requests                              |
| `changeset-status.yml` | the packages the PR releases, in the job summary (never fails)                                    | pull requests                              |
| `release.yml`          | the npm release (below)                                                                           | manual, default branch                     |
| `deploy.yml`           | the server image to Artifact Registry, then the image tag to `thenamespace/infra` for the rollout | manual, default branch                     |

Jobs get the least permissions they need, check out without persisted credentials and have
timeouts. Dependabot proposes action, npm and Docker updates weekly, a week after their release.
Check workflow changes locally with
`docker run --rm -v "$PWD:/repo" -w /repo rhysd/actionlint:1.7.12` and
`docker run --rm -v "$PWD:/repo" -w /repo ghcr.io/zizmorcore/zizmor:1.32.0 --config .github/zizmor.yml .`.

`deploy.yml` pushes to Artifact Registry in project `prod-9427` (`europe-west3`), tagging the image
with the short commit SHA and `latest`, then sends that tag to `thenamespace/infra`. It needs the
repository secrets `WORKLOAD_IDENTITY_PROVIDER` and `REPOSITORY_DISPATCH_PAT`.

### Hosted server

The image is the hosted server's configuration: the `Dockerfile` command sets the toolsets, the
Namespace RPC proxy, any origin, 60 requests per minute per IP and one proxy hop. It runs on the
production GKE cluster from `applications/apps/core/ens-mcp` in `thenamespace/infra` (the shared
`thenamespace/helm` chart, behind Traefik), which needs no environment variables, only:

- `ports.port: 8080`, the port the image listens on;
- readiness and liveness probes on `GET /healthz`;
- a memory request of at least 256 Mi (the server idles near 190 Mi).

Keep one replica. 2025-11-25 sessions and the rate limit live in each pod's memory: with more
replicas, a client whose request lands on another pod gets 404 and initialises again
(2026-07-28 clients have no session), and each pod counts its own limit.

Traefik receives the client's address (its service uses `externalTrafficPolicy: Local`), replaces
any `X-Forwarded-For` the client sent, and sets it to that address: one hop. If a proxy is ever put
in front of Traefik (for example Cloudflare proxying), raise `--proxy-hops` to match. After a
deploy, check that two requests from different networks are limited separately.

## Changesets

Add a changeset for every user-visible change to `@thenamespace/ens-mcp`:

```sh
pnpm changeset
```

Describe the change from a user's perspective. Tests, tooling and documentation-only changes
generally do not require a changeset.

## Releases

Releases run in `release.yml`, dispatched from `main` (Actions → Release → Run workflow), and
publish with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers): no npm token
exists anywhere, and npm attaches provenance to each version.

1. **Dry run** (the default): versions the packages inside the runner, runs
   `pnpm check` and `pnpm pack:check`, and packs. Nothing is pushed or published.
2. **Version PR**: run it again with _dry run_ unchecked. With pending changesets it opens or
   updates the `chore(release): version packages` PR. Review and merge it; run CI on its branch
   manually first, as GitHub does not run CI on PRs the workflow opens.
3. **Publish**: run it once more on the merged version commit. It prepares and packs, publishes
   those archives with provenance, pushes the tags and creates the GitHub releases.

On npmjs.com, configure `@thenamespace/ens-mcp` → Settings → Trusted publishing → GitHub Actions
with organization `thenamespace`, repository `ens-mcp` and workflow `release.yml`, then disallow
tokens under Publishing access.

## License

By contributing, you agree that your contributions are licensed under the
[Apache License 2.0](./LICENSE).
