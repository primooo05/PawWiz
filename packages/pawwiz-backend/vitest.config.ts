import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      SUPABASE_JWT_SECRET: 'super-secret-jwt-key-for-testing-only-do-not-use-in-prod',
      FRONTEND_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test'
    },
    setupFiles: ['./setupTests.ts']
  },
});
