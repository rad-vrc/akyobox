/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/games/whack-a-devilyagiakyo/Build/:path*.br",
        headers: [
          {
            key: "Content-Encoding",
            value: "br",
          },
        ],
      },
      {
        source: "/games/whack-a-devilyagiakyo/Build/:path*.js.br",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript",
          },
        ],
      },
      {
        source: "/games/whack-a-devilyagiakyo/Build/:path*.wasm.br",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
        ],
      },
      {
        source: "/games/whack-a-devilyagiakyo/Build/:path*.data.br",
        headers: [
          {
            key: "Content-Type",
            value: "application/octet-stream",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
