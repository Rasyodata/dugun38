# Düğün38 web — tek imajda build + çalıştırma (monorepo).
FROM node:20-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@12.8.1 --activate
# Prisma query engine için gerekli
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
# Prisma CLI (db push) ve client için SQLite dosya yolu. Kalıcı disk buraya bağlanır.
# PostgreSQL'e geçişte bu değeri Render'da override edin + schema provider'ı postgresql yapın.
ENV DATABASE_URL="file:/app/packages/db/prisma/dev.db"

# --- bağımlılıklar ---
FROM base AS deps
COPY pnpm-workspace.yaml package.json .npmrc pnpm-lock.yaml ./
COPY packages/core/package.json packages/core/
COPY packages/db/package.json packages/db/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile=false

# --- build ---
FROM base AS build
# deps katmanından kurulu node_modules'ı al (hoisted layout: kök + paket seviyeleri).
COPY --from=deps /app ./
# Kaynakları ekle (.dockerignore node_modules'ı dışlar → kurulu modüller korunur).
COPY . .
RUN pnpm --filter @dugun38/db generate
RUN pnpm --filter web build

# --- çalıştırma ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /app ./
# Render $PORT'u enjekte eder; Next start PORT env'ini kullanır.
EXPOSE 3000
# Şemayı uygula; yalnız SEED_ON_BOOT=1 ise demo veriyle doldur (yeniden başlatmada ezmez);
# sonra sunucuyu başlat.
CMD ["sh", "-c", "pnpm --filter @dugun38/db push && { [ \"$SEED_ON_BOOT\" = \"1\" ] && pnpm --filter @dugun38/db seed || true; } && pnpm --filter web start"]
