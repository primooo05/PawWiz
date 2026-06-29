import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Onboarding from '../pages/Onboarding.js';

// ---------------------------------------------------------------------------
// Mock Supabase — no real auth calls in unit tests
// ---------------------------------------------------------------------------
vi.mock('../lib/supabase.js', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal session fixture for step 3 (OTP step — name + email submitted). */
const otpStepSession = {
  id: 'otp-session-id',
  step: 3,
  ownerName: 'Ayla',
  ownerEmail: 'ayla@example.com',
  catsCount: null,
  customCatsCount: null,
  catName: null,
  catBreed: null,
  catMarking: null,
  catSex: null,
  catLifeStage: null,
  otpVerified: false,
};

function renderOnboarding(step: number) {
  return render(
    <MemoryRouter initialEntries={[`/onboarding?step=${step}`]}>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
      </Routes>
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('OnboardingScreen3 — OTP step UI', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockReturnValue('otp-session-id'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  it('renders the OTP input when on step 3', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      // send-otp call triggered by auto-send on step 3
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);

    // Guard may show briefly; wait for OTP input to appear
    const otpInput = await screen.findByPlaceholderText(/enter.*code/i);
    expect(otpInput).not.toBeNull();
    expect(otpInput.getAttribute('inputmode')).toBe('numeric');
    expect(otpInput.getAttribute('maxlength')).toBe('6');
  });

  it('renders the Resend Code button', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    await screen.findByPlaceholderText(/enter.*code/i);

    // After auto-send completes with cooldown=60, the Resend button should be disabled
    await waitFor(() => {
      const resendBtn = screen.getByRole('button', { name: /resend/i });
      expect(resendBtn).not.toBeNull();
    });
  });

  it('Resend button renders on step 3', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    await screen.findByPlaceholderText(/enter.*code/i);

    // The Resend Code button should be present
    const resendBtns = screen.getAllByRole('button', { name: /resend/i });
    expect(resendBtns.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Validation — empty / short submit
  // -------------------------------------------------------------------------

  it('shows error bubble when Next is clicked with an empty OTP field', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    await screen.findByPlaceholderText(/enter.*code/i);

    // Click Next with empty OTP — find the visible Next button (in pointer-events-auto container)
    vi.useFakeTimers();
    const nextBtns = screen.getAllByRole('button', { name: /next/i });
    const visibleNext = nextBtns.find(btn => btn.closest('.pointer-events-auto')) || nextBtns[0];
    fireEvent.click(visibleNext);

    act(() => { vi.advanceTimersByTime(3000); });
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/meow/i)).not.toBeNull();
    });
  });

  it('shows error bubble when Next is clicked with a 5-digit code', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    const otpInput = await screen.findByPlaceholderText(/enter.*code/i);
    fireEvent.change(otpInput, { target: { value: '12345' } });

    vi.useFakeTimers();
    const nextBtns = screen.getAllByRole('button', { name: /next/i });
    const visibleNext = nextBtns.find(btn => btn.closest('.pointer-events-auto')) || nextBtns[0];
    fireEvent.click(visibleNext);
    act(() => { vi.advanceTimersByTime(3000); });
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/meow/i)).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Verification — backend success path
  // -------------------------------------------------------------------------

  it('calls verify-otp endpoint with the correct code', async () => {
    const verifiedSession = { ...otpStepSession, step: 4, otpVerified: true };

    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => verifiedSession } as Response);

    renderOnboarding(3);
    const otpInput = await screen.findByPlaceholderText(/enter.*code/i);
    fireEvent.change(otpInput, { target: { value: '123456' } });

    vi.useFakeTimers();
    const nextBtns = screen.getAllByRole('button', { name: /next/i });
    const visibleNext = nextBtns.find(btn => btn.closest('.pointer-events-auto')) || nextBtns[0];
    fireEvent.click(visibleNext);
    act(() => { vi.advanceTimersByTime(3000); });
    vi.useRealTimers();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/onboarding/session/otp-session-id/verify-otp'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ code: '123456' }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Verification — backend failure path
  // -------------------------------------------------------------------------

  it('shows error bubble when backend returns 400 (wrong code)', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid or expired code' }),
      } as Response);

    renderOnboarding(3);
    const otpInput = await screen.findByPlaceholderText(/enter.*code/i);
    fireEvent.change(otpInput, { target: { value: '000000' } });

    vi.useFakeTimers();
    const nextBtns = screen.getAllByRole('button', { name: /next/i });
    const visibleNext = nextBtns.find(btn => btn.closest('.pointer-events-auto')) || nextBtns[0];
    fireEvent.click(visibleNext);
    act(() => { vi.advanceTimersByTime(3000); });
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/wrong code|expired|try again/i)).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Back navigation
  // -------------------------------------------------------------------------

  it('renders Back button on step 3', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    await screen.findByPlaceholderText(/enter.*code/i);

    const backBtns = screen.getAllByRole('button', { name: /back/i });
    const visibleBack = backBtns.find(btn => btn.closest('.pointer-events-auto'));
    expect(visibleBack).not.toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Auto-send OTP on step 3 mount
  // -------------------------------------------------------------------------

  it('automatically calls send-otp when step 3 is mounted', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => otpStepSession } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ cooldownSeconds: 60 }) } as Response);

    renderOnboarding(3);
    await screen.findByPlaceholderText(/enter.*code/i);

    await waitFor(() => {
      const sendOtpCalls = vi.mocked(fetch).mock.calls.filter(([url]) =>
        String(url).includes('send-otp')
      );
      expect(sendOtpCalls.length).toBe(1);
    });
  });

  // -------------------------------------------------------------------------
  // Guard — step tampering
  // -------------------------------------------------------------------------

  it('shows spinner when session step is 3 and URL says step=5 (guard catches skip)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => otpStepSession, // session.step = 3
    } as Response);

    renderOnboarding(5); // attempt to skip to step 5

    // Step 5 >= 6 is false, so the guard should show the spinner
    expect(screen.getByText(/Syncing with Wiz/i)).not.toBeNull();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/onboarding/session/otp-session-id')
      );
    });
  });
});
