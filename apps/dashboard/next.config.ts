import type { NextConfig } from "next";
import packageJson from "./package.json";

const nextConfig: NextConfig = {
  typedRoutes: true,
  transpilePackages: ["@while/ui"],
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default nextConfig;
