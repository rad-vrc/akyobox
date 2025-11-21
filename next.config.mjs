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
      // MP4 はキャッシュを強めにして起動を速くする
      {
        source: "/games/:path*/:file*.mp4",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "video/mp4" },
        ],
      },
    ];
  },
};

export default nextConfig;
