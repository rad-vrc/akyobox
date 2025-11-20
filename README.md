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
- **`server.js`**: Custom Node.js server for local development to handle Brotli (`.br`) compressed Unity assets correctly.
- **`vercel.json`**: Production configuration for Vercel to serve Brotli assets with the correct `Content-Encoding` headers.

## Getting Started

### Prerequisites

- Node.js 20.9+ (Required for Next.js 16)

### Installation

```bash
npm install
```

### Local Development

To run the project locally with full support for Unity's compressed assets, use the custom server script:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

The project is configured for deployment on **Vercel**.

The `vercel.json` file ensures that Unity's Brotli-compressed files (`.br`) are served with the correct headers in the production environment.
