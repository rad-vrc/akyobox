# WARP.md

This file provides guidance to WARP (warp.dev) and AI agents when working with code in this repository.

## Project Overview

**Akyobox** is a centralized web portal built with Next.js 16 (App Router) to host and showcase "Akyo" themed Unity WebGL games. The first featured game is **Whack-a-Akyo** (`whack-a-devilyagiakyo`).

## Essential Commands

### Development
```bash
npm run dev
```
Starts the Next.js development server with a custom `server.js` to handle Unity's Brotli-compressed assets (`.br`) correctly.
- URL: http://localhost:3000

### Building
```bash
npm run build
```
Runs the Next.js production build. Output goes to `.next/`.

### Linting
```bash
npm run lint
```
Runs Next.js built-in ESLint configuration.

## Architecture

### System Architecture
- **Frontend Framework**: Next.js 16 (App Router)
- **Hosting**: Vercel (Edge Network)
- **Game Engine**: Unity 6 (WebGL Export)

### Component Structure
```text
app/
├── layout.tsx          # Root Layout (Metadata, Global Styles)
├── page.tsx            # Main Portal Page (Game Container)
│   └── iframe          # Embeds Unity WebGL build
└── icon.png            # Application Icon
```

### Unity Integration
The Unity game is embedded via an `iframe` in `app/page.tsx`.
- **Source**: `public/games/whack-a-devilyagiakyo/index.html`
- **Assets**: Located in `public/games/whack-a-devilyagiakyo/Build/` (contains `.br` files)

## Project Structure

### Key Files
- `package.json`: Project dependencies and scripts.
- `next.config.mjs`: Next.js configuration.
- `server.js`: Custom Node.js server for local development (Brotli support).
- `vercel.json`: Vercel configuration for production headers (Brotli support).

### Key Directories
- `app/`: Next.js App Router source code.
- `public/`: Static assets.
  - `games/`: Unity WebGL build artifacts.
- `.kiro/`: Project documentation and specifications.

## Development Guidelines

### Asset Delivery (Brotli Support)
Unity WebGL builds use Brotli (`.br`) compression. Browsers require `Content-Encoding: br` headers.
- **Local**: Handled by `server.js`.
- **Production**: Handled by `vercel.json` headers.

### Deployment
- **Platform**: Vercel
- **Configuration**: `vercel.json` ensures correct headers for Unity assets.
- **Build Command**: `npm run build` (Next.js default)

## Troubleshooting

### Game Not Loading
- Check browser console for 404 errors.
- Verify `public/games/` contains the correct build files.
- Ensure `server.js` is running for local development (do not use default `next dev`).

### Compression Errors
- If the game fails to load with decompression errors, verify `vercel.json` headers are applied (in production) or `server.js` is active (locally).
