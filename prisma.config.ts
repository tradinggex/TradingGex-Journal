import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Fallback keeps prisma generate from failing on Vercel when DATABASE_URL
    // is not yet injected. At runtime the adapter uses the real env var.
    url: process.env["DATABASE_URL"] ?? "postgresql://localhost/build_placeholder",
  },
});
