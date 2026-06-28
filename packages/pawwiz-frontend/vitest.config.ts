import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Provide stub env vars so the Supabase client can be instantiated in tests
    // without real credentials. Individual tests mock the client as needed.
    env: {
      VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'placeholder-anon-key',
      VITE_TURNSTILE_SITE_KEY: 'placeholder-turnstile-key',
    },
  },
});
