import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NEXT_EXPORT ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
