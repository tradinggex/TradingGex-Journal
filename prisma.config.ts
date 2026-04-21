import { defineConfig } from "prisma/config";

// DATABASE_URL is loaded from .env locally and from Vercel env vars in production
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost/build_placeholder",
  },
});
