/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "example.com"],
    },
    experimental: {
        // Suppress static generation warnings during build
        serverComponentsExternalPackages: ["bcryptjs"],
    },
};

module.exports = nextConfig;
