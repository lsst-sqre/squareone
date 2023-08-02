FROM node:16-alpine as base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Stage 1. Prune dependencies
FROM base AS builder

RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
RUN pnpm install turbo --global
COPY . .
RUN turbo prune --scope=squareone --docker

# Stage 2. Install and build the app
FROM base AS installer

RUN apk add --no-cache libc6-compat
RUN apk update

RUN pnpm install turbo --global

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .

RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo run build --filter=squareone...

# Stage 3. The runtime image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

EXPOSE 3000
ENV PORT 3000

COPY --from=installer /app/apps/squareone/next.config.js .
COPY --from=installer /app/apps/squareone/package.json .
COPY --from=installer /app/apps/squareone/public .
COPY --from=installer /app/apps/squareone/.next .
COPY --from=installer /app/apps/squareone/node_modules .
COPY --from=installer /app/apps/squareone/squareone.config.schema.json .
COPY --from=installer /app/apps/squareone/squareone.config.yaml .
COPY --from=installer /app/apps/squareone/squareone.serverconfig.schema.json .
COPY --from=installer /app/apps/squareone/squareone.serverconfig.yaml .

CMD ["node_modules/.bin/next", "start"]
