# syntax=docker/dockerfile:1.7
#
# The ens-mcp server over HTTP, following Turborepo's Docker guide: `turbo prune` keeps only
# @thenamespace/ens-mcp and the workspace packages it depends on, so the dependency layer is reused
# until one of their manifests or the lockfile changes.
#
# Build from the repository root:
#   docker build -t ens-mcp .

ARG NODE_IMAGE=docker.io/library/node:26.13.1-bookworm-slim

FROM ${NODE_IMAGE} AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    TURBO_TELEMETRY_DISABLED="1"
# Node 25+ ships without corepack: the root package.json's packageManager, and the catalog's turbo.
RUN npm install --global --no-audit --no-fund pnpm@12.21.0 turbo@2.11.11

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @thenamespace/ens-mcp --docker --root-turbo-json .config/turbo.json

FROM base AS builder
WORKDIR /app

# Dependencies first: this layer changes only with the pruned manifests and lockfile. No lifecycle
# scripts: the root `prepare` installs git hooks and patches the dev toolchain, which the build
# does not use.
COPY --from=pruner /app/out/json/ ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

COPY --from=pruner /app/out/full/ ./
# Not part of any package: the tool configs, turbo.json among them.
COPY .config/ ./.config/
RUN turbo --root-turbo-json .config/turbo.json run build --filter=@thenamespace/ens-mcp...

# The package with its production dependencies only.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm --filter=@thenamespace/ens-mcp deploy --prod --ignore-scripts /prod

FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV="production" \
    HOST="0.0.0.0" \
    PORT="8080"
WORKDIR /app
COPY --from=builder --chown=node:node /prod/ ./
USER node
EXPOSE 8080
CMD ["node", "dist/bin.js", "--http"]
