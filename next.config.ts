import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/adapter-libsql", "@libsql/client", "libsql"],
  // Plant forms send base64 images via Server Actions; default ~1MB is too small.
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination: process.env.API_URL
          ? `${process.env.API_URL}/api/:path*`
          : process.env.NODE_ENV === "development"
            ? "http://127.0.0.1:8000/api/:path*"
            : "/api/",
      },
    ];
  },
};

export default nextConfig;
