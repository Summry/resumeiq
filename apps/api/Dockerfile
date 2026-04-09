# ==============================
# Stage 1: Builder
# ==============================
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY tsconfig.json ./

# Copy source
COPY packages/types ./packages/types
COPY apps/api ./apps/api

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build types then api
RUN pnpm --filter @resumeiq/types build
RUN pnpm --filter @resumeiq/api build

# ==============================
# Stage 2: Production
# ==============================
FROM node:20-alpine AS production

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/types/package.json ./packages/types/package.json
COPY apps/api/package.json ./apps/api/package.json

RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main"]