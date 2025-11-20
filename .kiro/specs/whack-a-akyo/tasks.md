# Tasks - Akyobox Portal

- [x] **1. Project Initialization**
  - Set up Next.js 16 App Router project.
  - Clean up default boilerplates.
  - Install necessary dependencies.

- [x] **2. Unity Game Integration**
  - Place Unity WebGL build in `public/games/whack-a-devilyagiakyo/`.
  - Implement `iframe` embedding in `app/page.tsx`.

- [x] **3. Local Development Support**
  - Create `server.js` to handle Brotli (`.br`) headers.
  - Update `package.json` scripts to use the custom server.

- [x] **4. Production Configuration**
  - Create `vercel.json` to configure headers for `.br` files on Vercel.

- [x] **5. UI/Assets**
  - Set up favicon (`app/icon.png`).
  - Basic styling for the game container.

- [ ] **6. Polish & Design (Next Steps)**
  - Enhance the portal design (Header, Footer, Background).
  - Add metadata for SEO (Open Graph, Twitter Cards).
  - (Optional) Implement a "Loading..." state before the iframe loads.

- [ ] **7. Game Update (Unity Side)**
  - Implement "Flame Aura" for Akyo.
  - Re-build and update `public/games/...` assets.