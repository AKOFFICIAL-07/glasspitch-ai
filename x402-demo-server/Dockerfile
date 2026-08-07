# syntax=docker/dockerfile:1

# ─── Build stage: compile TypeScript → dist/ ───────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Install ALL deps (devDeps included) for tsc + tsx
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile
COPY tsconfig.json ./
COPY index.ts endpoints.config.ts test.ts ./
COPY handlers/ ./handlers/
RUN npm run build

# ─── Runtime stage: only production deps + compiled output ─────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4021

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled server
COPY --from=build /app/dist ./dist

# The server binds 0.0.0.0:${PORT} by default (container-friendly)
EXPOSE 4021

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/ >/dev/null 2>&1 || exit 1

# node dist/index.js — NOT tsx (keeps the image small, no build step at boot)
CMD ["node", "dist/index.js"]
