FROM node:20-slim AS base
WORKDIR /app

# OpenSSL en rutas estándar del sistema — así Prisma lo encuentra sin problema
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# ── Dependencias ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY package.json ./
COPY packages/server/package.json ./packages/server/package.json
RUN npm install --workspace=packages/server

# ── Build ─────────────────────────────────────────────────────────────────────
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY packages/server ./packages/server

WORKDIR /app/packages/server
RUN node_modules/.bin/prisma generate
RUN npm run build

# ── Producción ────────────────────────────────────────────────────────────────
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/packages/server/dist ./dist
COPY --from=builder /app/packages/server/node_modules ./node_modules
COPY --from=builder /app/packages/server/prisma ./prisma
COPY packages/server/package.json ./package.json

EXPOSE 3001
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/index.js"]
