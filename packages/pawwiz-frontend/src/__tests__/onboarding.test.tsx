import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Onboarding from '../pages/Onboarding';

describe('Onboarding Page Guard', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('mock-session-id'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('redirects to step=2 if user attempts to skip to step=6 but has only completed up to step=2', async () => {
    const mockSession = {
      id: 'mock-session-id',
      step: 2,
      ownerName: 'Ayla',
      catsCount: null,
      customCatsCount: null,
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockSession,
    } as Response);

    const InnerRoute = () => {
      return (
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      );
    };

    render(
      <MemoryRouter initialEntries={['/onboarding?step=6']}>
        <InnerRoute />
      </MemoryRouter>
    );

    // It should initially show the loading guard
    expect(screen.getByText(/Syncing with Wiz/i)).not.toBeNull();

    // After resolution, it should fetch session details and redirect to step=2
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/onboarding/session/mock-session-id'));
    });
  });
});
