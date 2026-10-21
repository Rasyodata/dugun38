# Düğün38 web — tek aşamalı, sağlam build + çalıştırma (monorepo).
FROM node:20-slim
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
# Prisma CLI (db push) + client için SQLite yolu (kalıcı disk buraya bağlanır).
ENV DATABASE_URL="file:/app/packages/db/prisma/dev.db"

RUN corepack enable && corepack prepare pnpm@12.8.1 --activate
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Kaynakları kopyala (.dockerignore node_modules/.next/mobil/legacy'yi dışlar).
COPY . .

# Bağımlılıkları kur (devDependencies DAHİL — next build için typescript gerekli).
# NODE_ENV burada production DEĞİL; yoksa devDeps atlanır ve build kırılır.
RUN pnpm install --frozen-lockfile=false

# Prisma client üret + şemayı dev.db'ye uygula (tabloları oluştur).
# Build anında sitemap.xml gibi rotalar DB'yi sorguladığı için tablolar var olmalı
# (yoksa Prisma P2021 "table does not exist" ile build kırılır).
RUN pnpm --filter @dugun38/db push

# Next üretim derlemesi
RUN pnpm --filter web build

EXPOSE 3000
# Şemayı uygula; yalnız SEED_ON_BOOT=1 ise demo veriyle doldur; sonra sunucuyu başlat.
# NODE_ENV production runtime'da ayarlanır (render.yaml ve burada).
CMD ["sh", "-c", "export NODE_ENV=production && pnpm --filter @dugun38/db push && { [ \"$SEED_ON_BOOT\" = \"1\" ] && pnpm --filter @dugun38/db seed || true; } && pnpm --filter web start"]
