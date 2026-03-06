FROM node:20-alpine AS base
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json ./
RUN npm install

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Producción
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 3001

# migrate deploy: aplica migraciones pendientes de forma segura en producción
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
