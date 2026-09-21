import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function pooledDatabaseUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  if (!raw.includes("-pooler")) return raw;
  const extra: string[] = [];
  if (!/[?&]pgbouncer=/i.test(raw)) extra.push("pgbouncer=true");
  if (!/[?&]sslmode=/i.test(raw)) extra.push("sslmode=require");
  if (extra.length === 0) return raw;
  return `${raw}${raw.includes("?") ? "&" : "?"}${extra.join("&")}`;
}

const url = pooledDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: url ? { db: { url } } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
