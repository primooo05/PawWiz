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
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libraries into individually cacheable chunks.
        // Each named chunk is hashed separately — a Supabase SDK update
        // won't bust the motion cache, and vice versa.
        manualChunks(id) {
          // motion/react (Framer Motion) — animation runtime, ~100 kB gzip
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Supabase JS SDK — auth client, only needed on login/onboarding
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // react-datepicker + date-fns — only used by trackers/diet
          if (id.includes('node_modules/react-datepicker') || id.includes('node_modules/date-fns')) {
            return 'vendor-datepicker';
          }
          // lucide-react — icon library, large but tree-shaken per-route already
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-lucide';
          }
          // zod — validation schema runtime
          if (id.includes('node_modules/zod')) {
            return 'vendor-zod';
          }
          // React core + React Router — always needed, keep together as the base
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
        },
      },
    },
  },
})
