/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
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
