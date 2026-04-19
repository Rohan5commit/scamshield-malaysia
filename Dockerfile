FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN groupadd --system app && useradd --system --gid app --uid 1001 --create-home appuser

ENV NODE_ENV=production
ENV PORT=8080
ENV MOCK_AI=true
ENV STORAGE_PROVIDER=local

COPY --from=builder --chown=appuser:app /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:app /app/package.json ./package.json
COPY --from=builder --chown=appuser:app /app/backend/package.json ./backend/package.json
COPY --from=builder --chown=appuser:app /app/backend/dist ./backend/dist
COPY --from=builder --chown=appuser:app /app/backend/data ./backend/data
COPY --from=builder --chown=appuser:app /app/frontend/dist ./frontend/dist

EXPOSE 8080

USER appuser

CMD ["node", "backend/dist/server.js"]
