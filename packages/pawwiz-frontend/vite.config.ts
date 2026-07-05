import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'node:url'

// Load env files from the monorepo root so a single root `.env` serves every
// workspace. Only VITE_-prefixed variables are exposed to client code.
const monorepoRoot = fileURLToPath(new URL('../..', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  envDir: monorepoRoot,
  plugins: [
    // vite-plugin-svgr transforms *.svg?react imports into React components
    // in both dev (Vite's transform pipeline) and build (Rollup).
    // @svgr/rollup only worked at build time — not in the dev server.
    svgr(),
    react(),
    tailwindcss(),
  ],
})
