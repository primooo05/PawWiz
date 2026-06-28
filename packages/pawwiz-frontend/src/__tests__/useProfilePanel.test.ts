// Feature: onboarding-security-and-redirect, Property 8: ProfilePanel always reconciles to server-confirmed values

import { vi, describe, it, expect, afterEach, beforeEach } from 'vitest';
import fc from 'fast-check';
import { renderHook, act, cleanup } from '@testing-library/react';

vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabase.js';
import { useProfilePanel } from '../hooks/useProfilePanel.js';

// **Validates: Requirements 7.2**
describe('useProfilePanel', () => {
  describe('Property 8: ProfilePanel always reconciles to server-confirmed values', () => {
    beforeEach(() => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: { access_token: 'mock-token' } },
        error: null,
      } as any);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      cleanup();
    });

    it('reconciles optimistic data to server-confirmed profile after fetch', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            displayName: fc.string(),
            catName: fc.string(),
            catBreed: fc.option(fc.string()),
            catMarking: fc.option(fc.string()),
            catSex: fc.constantFrom('Female', 'Male'),
            catLifeStage: fc.constantFrom('Kitten', 'Adult', 'Senior'),
          }),
          fc.record({
            displayName: fc.string(),
            catName: fc.string(),
          }),
          async (serverData, optimisticData) => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
              ok: true,
              json: async () => serverData,
            }));

            try {
              const { result } = renderHook(() => useProfilePanel(optimisticData));
              await act(async () => {});
              expect(result.current.profile).toEqual(serverData);
            } finally {
              cleanup();
              vi.unstubAllGlobals();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('reconciles null optimistic data to server-confirmed profile after fetch', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            displayName: fc.string(),
            catName: fc.string(),
            catBreed: fc.option(fc.string()),
            catMarking: fc.option(fc.string()),
            catSex: fc.constantFrom('Female', 'Male'),
            catLifeStage: fc.constantFrom('Kitten', 'Adult', 'Senior'),
          }),
          async (serverData) => {
            vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
              ok: true,
              json: async () => serverData,
            }));

            try {
              const { result } = renderHook(() => useProfilePanel());
              await act(async () => {});
              expect(result.current.profile).toEqual(serverData);
            } finally {
              cleanup();
              vi.unstubAllGlobals();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
