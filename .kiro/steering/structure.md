# Project Structure

## Root Directory
- `index.html` - Entry HTML file with root div and module script
- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Vite configuration with React plugin
- `eslint.config.js` - ESLint configuration (flat config format)
- `tsconfig.json` - Root TypeScript config with project references
- `tsconfig.app.json` - App-specific TypeScript settings
- `tsconfig.node.json` - Node-specific TypeScript settings

## Source Code (`src/`)
- `main.tsx` - Application entry point, renders App in StrictMode
- `App.tsx` - Main application component
- `App.css` - Component-specific styles
- `index.css` - Global styles
- `vite-env.d.ts` - Vite type definitions
- `assets/` - Static assets (images, SVGs)

## Public Assets (`public/`)
Static files served directly:
- Character images (akyo_devilyagi.png, akyo_humanoid.png, akyo_yagi.png)
- Game assets (GameTitle.png, VRChat screenshot)
- Vite logo (vite.svg)

## Code Conventions
- Use `.tsx` extension for React components
- Import React hooks from 'react'
- Use functional components with hooks
- Export components as default exports
- Include `.tsx` extension in imports
- CSS modules or component-scoped CSS files alongside components
