/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Rewrite API calls to Python backend for AI operations
    async rewrites() {
        return [
            {
                source: '/api/ai/:path*',
                destination: 'http://127.0.0.1:8000/:path*',
            },
        ];
    },
};

module.exports = nextConfig;
