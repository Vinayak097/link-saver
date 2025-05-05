import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Enable server-side environment variables
  serverRuntimeConfig: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  },
  // Enable client-side environment variables (be careful not to expose secrets)
  publicRuntimeConfig: {
    // Add any public environment variables here
  },
};

export default nextConfig;
