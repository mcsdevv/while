import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@while/ui"],
};

const withMDX = createMDX();

export default withMDX(nextConfig);
