import type { NextConfig } from "next";
module.exports = {
    allowedDevOrigins: ['192.168.0.143'],
}
const nextConfig: NextConfig = {
    experimental: {
    },
    allowedDevOrigins: ['172.19.32.1', 'localhost:3000'],
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
            { protocol: "https", hostname: "github.com" },
        ],
    },
    // Allow server-side streaming for AI responses
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
                ],
            },
        ];
    },
};

export default nextConfig;