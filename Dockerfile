# Stage 1: Build the application
FROM mhart/alpine-node:14 AS builder

WORKDIR /app

COPY package.json package-lock.json ./

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
