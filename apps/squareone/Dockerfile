FROM node:22.13.0-alpine AS base

RUN npm install -g corepack@latest  # Ensure latest corepack
RUN corepack enable
RUN apk add --no-cache libc6-compat
RUN apk update
RUN npm install -g turbo
ENV CI=1

FROM base AS builder

WORKDIR /app

COPY . .

RUN turbo prune --scope=squareone --docker


FROM base AS installer

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Remote caching for Turborepo
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
    --mount=type=secret,id=TURBO_API,env=TURBO_API \
    --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
    turbo run build --filter=squareone...

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

# TODO: Maybe use the npm script?
CMD ["pnpm", "--filter", "squareone", "run", "start"]
