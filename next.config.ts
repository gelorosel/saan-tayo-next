import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Enable compression
  compress: true,
  // Optimize production builds
  poweredByHeader: false,
  // Enable React strict mode for better development
  reactStrictMode: true,
  // Generate ETags for caching
  generateEtags: true,
};

export default nextConfig;
