import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL!;
  const isRemote =
    !connectionString.includes("localhost") &&
    !connectionString.includes("127.0.0.1");
  const adapter = new PrismaPg({
    connectionString,
    ...(isRemote && { ssl: { rejectUnauthorized: false } }),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
};

type PrismaInstance = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaInstance | undefined;
};

/**
 * Returns a Prisma client, creating a fresh one if the cached instance is stale
 * (e.g. after `prisma generate` updates the schema during hot-reloads in dev).
 * A stale instance is detected by checking that the current schema's models
 * are accessible — if `prisma.user` is missing, the instance predates the User model.
 */
function getOrCreateClient(): PrismaInstance {
  const cached = globalForPrisma.prisma;
  // Validate cached instance is compatible with the current schema.
  // `user` was added in the auth migration; if it's absent the instance is stale.
  if (cached != null && "user" in (cached as object)) {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getOrCreateClient();
