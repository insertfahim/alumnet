/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ["localhost", "example.com"],
        formats: ["image/webp", "image/avif"],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },
    experimental: {
        // Suppress static generation warnings during build
        serverComponentsExternalPackages: ["bcryptjs"],
    },
    // Enable SWC minification for better performance
    swcMinify: true,
    // Optimize fonts
    optimizeFonts: true,
    // Enable compression
    compress: true,
    // Optimize CSS
    optimizeCss: true,
};

module.exports = nextConfig;
