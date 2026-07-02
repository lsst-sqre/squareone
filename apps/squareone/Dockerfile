# Git commit SHA threaded in at build time, e.g.
# `docker build --build-arg SOURCE_COMMIT=$(git rev-parse HEAD)`. Used as the
# Sentry release so client/server/edge events and uploaded source maps all
# associate with this build. Declared globally here and re-declared in the
# stages that consume it (Docker scopes ARGs per-stage after each FROM).
ARG SOURCE_COMMIT

FROM node:22.21.1-alpine AS base

RUN npm install -g corepack@latest  # Ensure latest corepack
RUN corepack enable
RUN corepack prepare pnpm@10.20.0 --activate
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN apk add --no-cache libc6-compat
RUN apk update
ENV CI=1

FROM base AS builder

WORKDIR /app

COPY . .

RUN pnpm dlx turbo@2.10.0 prune --scope=squareone --docker


FROM base AS installer

WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/scripts/ ./scripts/
RUN pnpm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Stamp the build with the source commit so the Sentry bundler plugin marks
# client/server bundles and uploads source maps under this release. Unset in
# local builds, where the plugin falls back to no release.
ARG SOURCE_COMMIT
ENV SENTRY_RELEASE=$SOURCE_COMMIT

# Remote caching for Turborepo
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=TURBO_TOKEN,env=TURBO_TOKEN \
    --mount=type=secret,id=TURBO_API,env=TURBO_API \
    --mount=type=secret,id=TURBO_TEAM,env=TURBO_TEAM \
    pnpm build --filter=squareone...

FROM base AS runner

WORKDIR /app

# Carry the source commit and image tag into the runtime image: server/edge
# `Sentry.init` reads SENTRY_RELEASE at runtime, and the OCI revision label
# records the build's commit for `docker inspect`. VERSION (the image's primary
# tag) is likewise exposed as SQUAREONE_VERSION so the app self-reports it as the
# runtime `version` in the `<head>`, server logs, and Sentry, in addition to the
# OCI `version` label.
ARG SOURCE_COMMIT
ARG VERSION
ENV SENTRY_RELEASE=$SOURCE_COMMIT
ENV SQUAREONE_VERSION=$VERSION

# OCI image annotations. Static fields surface on the GHCR package page; `source`
# links the package to its repository (and inherits repo visibility/access),
# while `revision`/`version` record the exact build. See GitHub's container
# registry labelling guidance.
LABEL org.opencontainers.image.source="https://github.com/lsst-sqre/squareone" \
      org.opencontainers.image.url="https://github.com/lsst-sqre/squareone" \
      org.opencontainers.image.title="Squareone" \
      org.opencontainers.image.description="Squareone: the Rubin Science Platform landing page and front-end portal, built with Next.js." \
      org.opencontainers.image.vendor="Rubin Observatory / SQuaRE" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.revision="$SOURCE_COMMIT" \
      org.opencontainers.image.version="$VERSION"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV COREPACK_ENABLE_NETWORK=0
ENV COREPACK_HOME=/app/.cache/corepack

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy corepack cache from base stage so pnpm is available
COPY --from=base --chown=nextjs:nodejs /root/.cache/node/corepack /app/.cache/corepack

USER nextjs

EXPOSE 3000
ENV PORT=3000

COPY --from=installer /app .

CMD ["pnpm", "--filter", "squareone", "run", "start"]
