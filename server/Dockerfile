FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/index.ts ./
COPY server/tsconfig.json ./
COPY server/routes/ ./routes/
COPY server/services/ ./services/
COPY server/cron/ ./cron/
COPY server/middleware/ ./middleware/
RUN npx tsc

FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server/migrate.js ./
COPY db/ /db/
EXPOSE 3001
CMD ["sh", "-c", "node migrate.js && node dist/index.js"]
