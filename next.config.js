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
        // Enable performance optimizations
        optimizePackageImports: ["lucide-react", "@tanstack/react-query"],
        // Optimize server components
        serverMinification: true,
    },
    // Enable SWC minification for better performance
    swcMinify: true,
    // Optimize fonts
    optimizeFonts: true,
    // Enable compression
    compress: true,
    // Enable PPR (Partial Prerendering) for better performance
    poweredByHeader: false,
    // Optimize webpack
    webpack: (config, { dev, isServer }) => {
        // Optimize for production
        if (!dev) {
            config.optimization = {
                ...config.optimization,
                sideEffects: false,
                // Enable tree shaking
                usedExports: true,
                // Split chunks for better caching
                splitChunks: {
                    chunks: "all",
                    cacheGroups: {
                        vendor: {
                            test: /[\\/]node_modules[\\/]/,
                            name: "vendors",
                            chunks: "all",
                        },
                        common: {
                            name: "common",
                            minChunks: 2,
                            chunks: "all",
                            enforce: true,
                        },
                    },
                },
            };
        }
        return config;
    },
    // Headers for performance
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    {
                        key: "X-DNS-Prefetch-Control",
                        value: "on",
                    },
                    {
                        key: "X-XSS-Protection",
                        value: "1; mode=block",
                    },
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                ],
            },
            {
                source: "/api/:path*",
                headers: [
                    {
                        key: "Cache-Control",
                        value: "public, s-maxage=60, stale-while-revalidate=300",
                    },
                ],
            },
        ];
    },
};

module.exports = nextConfig;
