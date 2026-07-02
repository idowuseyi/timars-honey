import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product images are served from Cloudflare R2 in production; allow the R2 host
  // once configured. Kept permissive-off for now (local/static assets only).
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
