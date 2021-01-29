# Stage 1: Build the application
FROM mhart/alpine-node:14 AS builder

# GitHub Personal Access token to install from GitHub Packages
# Needs:
# 'repo', 'write:packages', and 'read:packages'
ARG GH_PKG_TOKEN

WORKDIR /app

RUN echo "//npm.pkg.github.com/:_authToken=${GH_PKG_TOKEN}" > ~/.npmrc

COPY package.json package-lock.json .npmrc ./
RUN npm install

COPY . .

RUN npm run build
RUN npm install --production


# Stage 2: Install pre-built app and deps for production
FROM mhart/alpine-node:14 as production

WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node_modules/.bin/next", "start"]
