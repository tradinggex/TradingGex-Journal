import type { NextConfig } from "next";

const ALLOWED_ORIGINS = [
  "https://tradinggexjournal.com",
  "https://tradinggex-journal.netlify.app",
  "https://trading-journal-eta-hazel.vercel.app",
  "http://localhost:3000",
];

const CORS_HEADERS = [
  { key: "Access-Control-Allow-Methods",  value: "GET, POST, PUT, DELETE, PATCH, OPTIONS" },
  { key: "Access-Control-Allow-Headers",  value: "Content-Type, Authorization, X-Requested-With" },
  { key: "Access-Control-Allow-Credentials", value: "true" },
  { key: "Access-Control-Max-Age",        value: "86400" },
  { key: "Vary",                          value: "Origin" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wsqtwhtswimrpcdwihjh.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return ALLOWED_ORIGINS.map((origin) => ({
      source: "/api/:path*",
      has: [{ type: "header", key: "origin", value: origin }],
      headers: [
        { key: "Access-Control-Allow-Origin", value: origin },
        ...CORS_HEADERS,
      ],
    }));
  },
};

export default nextConfig;
