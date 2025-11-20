# Project Structure

## Directory Layout

```
/
├── .kiro/                  # Project documentation & hooks
├── app/                    # Next.js App Router directories
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage (Game Portal)
│   └── icon.png            # App Icon (Favicon)
├── public/                 # Static assets
│   └── games/              # Unity WebGL builds
│       └── whack-a-devilyagiakyo/
├── .gitignore
├── next.config.mjs         # Next.js configuration
├── package.json
├── server.js               # Custom server for local dev (.br support)
├── tsconfig.json
└── vercel.json             # Vercel deployment config (.br support)
```

## Key Files
- `app/page.tsx`: Main entry point for the portal, currently embeds the Unity game.
- `server.js`: Custom Node.js server to handle Content-Encoding headers for Unity's Brotli compressed files during local development.
- `vercel.json`: Configuration to ensure Vercel serves `.br` files with correct headers.

## Code Conventions
- Use `.tsx` extension for React components
- Import React hooks from 'react'
- Use functional components with hooks
- Export components as default exports
- Include `.tsx` extension in imports
- CSS modules or component-scoped CSS files alongside components
