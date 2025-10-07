import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["i.pravatar.cc"],
    },
    eslint: {
        // Ignore all ESLint errors during build (useful for Vercel deployment)
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
