import type { NextConfig } from 'next';

const gameBuildBase = '/games/whack-a-devilyagiakyo/Build';
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
    images: {
        qualities: [60, 75],
    },
    async rewrites() {
        if (!isDevelopment) return [];
        return [
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.data`,
                destination: `${gameBuildBase}/whack-a-devilyagiakyo.data.br`,
            },
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.framework.js`,
                destination: `${gameBuildBase}/whack-a-devilyagiakyo.framework.js.br`,
            },
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.wasm`,
                destination: `${gameBuildBase}/whack-a-devilyagiakyo.wasm.br`,
            },
        ];
    },
    async headers() {
        if (!isDevelopment) return [];
        return [
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.data`,
                headers: [
                    { key: 'Content-Type', value: 'application/octet-stream' },
                    { key: 'Content-Encoding', value: 'br' },
                ],
            },
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.framework.js`,
                headers: [
                    { key: 'Content-Type', value: 'application/javascript' },
                    { key: 'Content-Encoding', value: 'br' },
                ],
            },
            {
                source: `${gameBuildBase}/whack-a-devilyagiakyo.wasm`,
                headers: [
                    { key: 'Content-Type', value: 'application/wasm' },
                    { key: 'Content-Encoding', value: 'br' },
                ],
            },
        ];
    },
};

export default nextConfig;
