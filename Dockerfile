# --- Dependencies stage ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- Build stage ---
FROM node:20-alpine AS builder
WORKDIR /app
# Prisma engines on Alpine require OpenSSL compatibility at build time for generate
RUN apk add --no-cache openssl1.1-compat libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npx prisma generate

# --- Runtime stage ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Install OpenSSL compatibility for Prisma engines at runtime
RUN apk add --no-cache openssl1.1-compat libc6-compat
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY openapi.yaml ./
COPY prisma ./prisma
EXPOSE 3000
CMD ["sh","-c","npx prisma migrate deploy && node dist/server.js"]
