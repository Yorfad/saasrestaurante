FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ── Dependencias ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json ./
COPY packages/server/package.json ./packages/server/package.json
RUN npm install --workspace=packages/server

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY packages/server ./packages/server

# prisma generate corre desde /app donde están los node_modules
RUN node_modules/.bin/prisma generate --schema=packages/server/prisma/schema.prisma

# tsc corre desde packages/server donde está tsconfig.json
RUN cd packages/server && /app/node_modules/.bin/tsc

# ── Producción ────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/prisma ./prisma
COPY packages/server/package.json ./package.json

EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/index.js"]
