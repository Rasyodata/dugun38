import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "node:url";
import path from "node:path";

// SQLite dosyasını çalışma dizininden bağımsız, modül konumuna göre çözümle.
// Böylece hem apps/web hem seed hem CLI aynı dosyayı görür.
const here = path.dirname(fileURLToPath(import.meta.url)); // packages/db/src
const dbFile = path.resolve(here, "..", "prisma", "dev.db");
const datasourceUrl = process.env.DATABASE_URL ?? `file:${dbFile}`;

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl,
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export * from "@prisma/client";
export { hashPassword, verifyPassword } from "./password";
