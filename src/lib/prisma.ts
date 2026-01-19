/**
 * Prisma Client Singleton Instance
 *
 * This ensures we use a single instance of PrismaClient across the application
 * to avoid exhausting database connections in development.
 *
 * Usage:
 * import { prisma } from '@/lib/prisma';
 * const users = await prisma.user.findMany();
 */

import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
