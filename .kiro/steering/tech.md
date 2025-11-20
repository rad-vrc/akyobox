# Technology Stack

## Core Framework
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Runtime**: Node.js (v20.9+ required)

## Build & Bundling
- **Bundler**: Turbopack (Next.js default)
- **Linting**: ESLint (v9) + eslint-config-next
- **Type Checking**: TypeScript (tsc)

## Deployment
- **Platform**: Vercel
- **Configuration**: `vercel.json` (Custom headers for Brotli/.br support)

## Integration
- **Unity WebGL**: Hosted in `public/games/`, embedded via `iframe`.
- **Compression**: Custom server (`server.js`) for local dev, Vercel config for production to handle `.br` files.

## State Management
- **Local State**: React `useState`, `useReducer`
- **Global State**: (Not yet implemented, consider Context API or Zustand if needed)

## Styling
- **Method**: CSS Modules or Inline Styles (currently standard CSS)
- **Design System**: (Pending)
## Common Commands

### Development
```bash
npm run dev
```
Starts the Vite development server with HMR

### Build
```bash
npm run build
```
Compiles TypeScript and builds for production

### Linting
```bash
npm run lint
```
Runs ESLint on the codebase

### Preview
```bash
npm run preview
```
Preview the production build locally

## TypeScript Configuration
- Target: ES2020
- Strict mode enabled
- Module resolution: bundler
- JSX: react-jsx
- Unused locals and parameters are flagged as errors
- No fallthrough cases in switch statements
