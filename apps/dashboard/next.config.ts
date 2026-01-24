import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ["@notion-gcal-sync/ui"],
};

export default nextConfig;
