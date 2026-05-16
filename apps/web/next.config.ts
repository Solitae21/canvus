import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@canvus/api"],
  serverExternalPackages: ["@prisma/client"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
