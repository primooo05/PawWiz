import { defineConfig } from 'vitest/config';

export const JWT_SECRET = 'super-secret-jwt-key-for-testing-only-do-not-use-in-prod';
export const TEST_USER_ID = 'test-user-uuid-1234';
export const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

export default defineConfig({
  test: {
    env: {
      SUPABASE_JWT_SECRET: JWT_SECRET,
      FRONTEND_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test'
    },
    setupFiles: ['./setupTests.ts']
  },
});
