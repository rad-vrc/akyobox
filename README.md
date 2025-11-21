# Akyobox

Akyobox is a web portal designed to host and showcase "Akyo" themed Unity WebGL games, starting with **Whack-a-Akyo**.

The project has been migrated from a Vite template to **Next.js 16 (App Router)** to provide a robust, scalable platform with server-side capabilities and optimized asset delivery.

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Game Engine:** Unity 6 (WebGL Export)
- **Hosting:** [Vercel](https://vercel.com/)
- **Styling:** CSS Modules / Tailwind CSS (if applicable)

## Project Structure

- **`app/`**: Next.js App Router source code.
  - `page.tsx`: Main entry point, embeds the Unity game via `iframe`.
- **`public/games/`**: Hosts the Unity WebGL build artifacts.
  - `whack-a-devilyagiakyo/`: The specific build for the "Whack-a-Akyo" game.
- **`vercel.json`**: Production configuration for Vercel to serve Brotli assets with the correct `Content-Encoding` headers.

## Current state (2025-11-21)

- Next.js 16 / App Router。
- カスタム server.js は削除し、`npm run dev` = `next dev`, `npm run start` = `next start`。
- Unity の Brotli 圧縮（`.wasm.br / .js.br / .data.br`）は `next.config.mjs` の headers で自動付与される。
- Unity ビルド成果物は `public/games/whack-a-devilyagiakyo/` に配置する。Unity フォルダは `.gitignore` で除外。

### Unity ローカル変更（未コミット）
- 残り30秒で Akyo スポーン間隔を 1/2（速度2倍）にする調整を `GameManager.cs` / `AkyoSpawner.cs` に入れているが、Unity フォルダは `.gitignore` のためリポジトリには含めていない。ビルドする場合はローカルの Unity プロジェクトで再ビルドして `public/games/...` を更新する。

## Getting Started

### Prerequisites

- Node.js 20.9+ (Required for Next.js 16)

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Configured for **Vercel**. `next.config.mjs` sets headers to serve Unity’s Brotli assets with the correct `Content-Encoding`/`Content-Type`.
