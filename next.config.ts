import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serves the whole app under https://tool.selinnaowen.com/spending-tracker
  // instead of the domain root. All routes, assets, and API endpoints
  // (including Better Auth's /api/auth/*) are automatically prefixed.
  basePath: "/spending-tracker",
};

export default nextConfig;
