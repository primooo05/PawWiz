import { defineConfig } from 'vitest/config';

export const JWT_SECRET = 'super-secret-jwt-key-for-testing-only-do-not-use-in-prod';
export const TEST_USER_ID = 'test-user-uuid-1234';
export const SESSION_ID = '550e8400-e29b-41d4-a716-446655440000';

// The auth middleware decodes SUPABASE_JWT_SECRET from base64 (mirroring how
// Supabase stores the JWT secret in its dashboard). Tests must store it the
// same way so jwt.verify receives the correct raw bytes.
const JWT_SECRET_B64 = Buffer.from(JWT_SECRET).toString('base64');

export default defineConfig({
  test: {
    env: {
      SUPABASE_JWT_SECRET: JWT_SECRET_B64,
      FRONTEND_ORIGIN: 'http://localhost:5173',
      NODE_ENV: 'test'
    },
    setupFiles: ['./setupTests.ts']
  },
});
