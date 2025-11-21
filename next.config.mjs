/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // Allow any unity game under /games/... to serve .br with proper headers
      {
        source: "/games/:path*\\.wasm\\.br",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
        ],
      },
      {
        source: "/games/:path*\\.js\\.br",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
        ],
      },
      {
        source: "/games/:path*\\.data\\.br",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
        ],
      },
      // Unity Build フォルダを明示的にカバー（モバイル互換性のため念押し）
      {
        source: "/games/:path*/Build/:file*.wasm.br",
        headers: [
          { key: "Content-Type", value: "application/wasm" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
        ],
      },
      {
        source: "/games/:path*/Build/:file*.js.br",
        headers: [
          { key: "Content-Type", value: "application/javascript" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
        ],
      },
      {
        source: "/games/:path*/Build/:file*.data.br",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Encoding", value: "br" },
          { key: "Vary", value: "Accept-Encoding" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable, no-transform" },
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
