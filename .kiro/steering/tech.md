# Technology Stack

## Core Technologies
- **Framework**: React 18.3.1
- **Language**: TypeScript 5.5.3
- **Build Tool**: Vite 5.4.1
- **Module System**: ES Modules

## Development Tools
- **Linting**: ESLint 9.9.0 with TypeScript ESLint
- **Type Checking**: TypeScript with strict mode enabled
- **React Plugins**: 
  - eslint-plugin-react-hooks
  - eslint-plugin-react-refresh
  - @vitejs/plugin-react

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
