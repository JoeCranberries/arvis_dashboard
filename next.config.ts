import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the MongoDB driver (and its optional native deps) out of the bundle.
  serverExternalPackages: ["mongodb"],
};

export default nextConfig;
