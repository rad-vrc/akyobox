/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Allow any unity game under /games/... to serve .br with proper headers
      {
        source: "/games/:path*.wasm.br",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
      {
        source: "/games/:path*.js.br",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
      {
        source: "/games/:path*.data.br",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Encoding", value: "br" },
        ],
      },
    ];
  },
};

export default nextConfig;
