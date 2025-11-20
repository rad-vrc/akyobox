## Status Update (2025-11-19 22:00 JST)

- **Framework Migration**: Successfully migrated from Vite to **Next.js 16 (App Router)**.
- **Unity Integration**:
  - Unity 6 WebGL build (`whack-a-devilyagiakyo`) is hosted in `public/games/`.
  - Embedded via `iframe` in `app/page.tsx`.
- **Brotli Compression Support**:
  - **Local Dev**: Implemented `server.js` custom server to handle `.br` files with correct `Content-Encoding` headers.
  - **Production (Vercel)**: Created `vercel.json` with header configurations for `.br` files.
- **Assets**:
  - Copied Unity's favicon to `app/icon.png` for automatic Next.js handling.
- **Next Steps**:
  - User will polish the game in Unity (e.g., adding flame aura to Akyo).
  - Re-integration of the updated build into the Next.js portal.
