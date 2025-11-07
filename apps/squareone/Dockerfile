FROM node:22.21.1-alpine AS base

RUN npm install -g corepack@latest  # Ensure latest corepack
RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN apk update
ENV CI=1

FROM base AS builder

WORKDIR /app

COPY . .

RUN pnpm dlx turbo@2.6.0 prune --scope=squareone --docker


FROM base AS installer

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY --from=builder /app/scripts/ ./scripts/
COPY turbo.json turbo.json

# Remote caching for Turborepo
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
    --mount=type=secret,id=TURBO_API,env=TURBO_API \
    --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
    pnpm build --filter=squareone...

FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
ENV PORT=3000

COPY --from=installer /app .

CMD ["pnpm", "--filter", "squareone", "run", "start"]
