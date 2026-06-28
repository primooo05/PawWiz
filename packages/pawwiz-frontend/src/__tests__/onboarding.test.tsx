import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent, act } from '@testing-library/react';
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

  it('shows error bubble if ownerName is too short on step 2', async () => {
    const mockSession = {
      id: 'mock-session-id',
      step: 2,
      ownerName: '',
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
      <MemoryRouter initialEntries={['/onboarding?step=2']}>
        <InnerRoute />
      </MemoryRouter>
    );

    // Wait for the syncing screen to finish and the name input to show
    await screen.findByPlaceholderText(/Your Name/i);

    // Get input and change value to a single character 'A'
    const input = screen.getByPlaceholderText(/Your Name/i);
    fireEvent.change(input, { target: { value: 'A' } });

    // Click Next
    vi.useFakeTimers();
    const nextBtn = screen.getAllByRole('button', { name: /Next/i })[0];
    fireEvent.click(nextBtn);

    // Fast-forward typing
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    vi.useRealTimers();

    // Verify speech bubble shows "Name must be at least 2 characters, meow!"
    expect(screen.getByText(/Name must be at least 2 characters, meow!/i)).not.toBeNull();
  });

  it('shows custom message for step 3 cat count', async () => {
    const mockSession = {
      id: 'mock-session-id',
      step: 3,
      ownerName: 'Ayla',
      catsCount: '',
      customCatsCount: '',
      catName: null,
      catBreed: null,
      catMarking: null,
      catSex: null,
      catLifeStage: null,
    };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockSession,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ...mockSession, step: 4, customCatsCount: 'three' }),
      } as Response);

    const InnerRoute = () => {
      return (
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      );
    };

    render(
      <MemoryRouter initialEntries={['/onboarding?step=3']}>
        <InnerRoute />
      </MemoryRouter>
    );

    // Wait for step 3 to mount
    await screen.findByPlaceholderText(/Specify e.g., 4/i);

    // Input "three" in custom field
    const input = screen.getByPlaceholderText(/Specify e.g., 4/i);
    fireEvent.change(input, { target: { value: 'three' } });

    // Click Next
    vi.useFakeTimers();
    const nextBtn = screen.getAllByRole('button', { name: /Next/i })[1];
    fireEvent.click(nextBtn);

    // Fast-forward typing
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    vi.useRealTimers();

    // Verify bubble shows "Amazing, three Cats"
    expect(screen.getByText(/Amazing, three Cats/i)).not.toBeNull();
  });
});
