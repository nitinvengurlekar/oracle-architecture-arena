import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  deploymentId: process.env.NEXT_DEPLOYMENT_ID,
  serverExternalPackages: ["oracledb"],
};

export default nextConfig;
