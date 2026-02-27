# -----------------------
# Build stage
# -----------------------
FROM node:22-alpine AS build

# Install pnpm
RUN npm install -g pnpm@9.4.0

WORKDIR /app

# Copy root manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy workspace package manifests (important for correct install graph)
COPY apps/server/package.json apps/server/
COPY packages/config/package.json packages/config/

# Env
ENV CI=true

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN pnpm run build --filter=ens-mcp

# Prune to production deps only for this app
RUN pnpm --filter=ens-mcp deploy --prod /prod

# -----------------------
# Serve stage
# -----------------------
FROM node:22-alpine AS serve

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /prod .

EXPOSE 3000

CMD ["node", "dist/cli.mjs", "--http", "--port", "3000"]