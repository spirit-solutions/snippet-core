FROM oven/bun:1.2.20-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --production --frozen-lockfile

COPY . .

RUN bun run build

FROM oven/bun:1.2.20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 12000

USER bun

CMD ["bun", "run", "dist/main.js"]
