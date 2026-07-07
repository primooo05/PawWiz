import { useState, useCallback } from 'react';
import { API_BASE } from '../../lib/config.js';

export function useOnboarding() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const val = localStorage.getItem('pawwiz_onboarding_session_id');
    return (val === 'null' || val === 'undefined') ? null : val;
  });
  // Session token issued at creation — required on all mutating operations to
  // prevent UUID-only session takeover from a separate browser context.
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('pawwiz_onboarding_session_token');
  });
  const [sessionStep, setSessionStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [catsCount, setCatsCount] = useState<string>(() => {
    return localStorage.getItem('pawwiz_cats_count') ?? '';
  });
  const [customCatsCount, setCustomCatsCount] = useState<string>(() => {
    return localStorage.getItem('pawwiz_custom_cats_count') ?? '';
  });
  const [catName, setCatName] = useState('');
  const [catBreed, setCatBreed] = useState('');
  const [catMarking, setCatMarking] = useState('');
  const [catSex, setCatSex] = useState('');
  const [catLifeStage, setCatLifeStage] = useState('');

  // Persisting wrappers for catsCount/customCatsCount — these drive the
  // totalCats calculation on step 7 and must survive a page refresh.
  const setCatsCountPersisted = useCallback((v: string) => {
    localStorage.setItem('pawwiz_cats_count', v);
    setCatsCount(v);
  }, []);
  const setCustomCatsCountPersisted = useCallback((v: string) => {
    localStorage.setItem('pawwiz_custom_cats_count', v);
    setCustomCatsCount(v);
  }, []);

  // Accumulated cats for multi-cat onboarding. Each entry is a complete cat
  // snapshot. Populated after each life-stage step and sent to the backend in
  // one shot at profile-creation time — no staging DB rows needed.
  // Persisted to localStorage so a page refresh doesn't lose entries.
  const [pendingCats, setPendingCats] = useState<Array<{
    catName: string;
    catBreed: string;
    catMarking: string;
    catSex: string;
    catLifeStage: string;
  }>>(() => {
    try {
      const stored = localStorage.getItem('pawwiz_pending_cats');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const initializeSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to initialize onboarding session');
      const data = await res.json();
      if (!data?.id) throw new Error('Invalid onboarding session response');
      localStorage.setItem('pawwiz_onboarding_session_id', data.id);
      // Persist the session token alongside the session ID so it survives page reloads.
      if (data.sessionToken) {
        localStorage.setItem('pawwiz_onboarding_session_token', data.sessionToken);
        setSessionToken(data.sessionToken);
      }
      setSessionId(data.id);
      setSessionStep(data.step);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/session/${id}`);
      if (!res.ok) {
        // If session not found, clear it
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          setSessionId(null);
        }
        throw new Error('Onboarding session not found');
      }
      const data = await res.json();
      setSessionStep(data.step);
      setOwnerName(data.ownerName || '');
      setOwnerEmail(data.ownerEmail || '');
      setCatsCountPersisted(data.catsCount || '');
      setCustomCatsCountPersisted(data.customCatsCount || '');
      setCatName(data.catName || '');
      setCatBreed(data.catBreed || '');
      setCatMarking(data.catMarking || '');
      setCatSex(data.catSex || '');
      setCatLifeStage(data.catLifeStage || '');
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitStep = useCallback(async (step: number, stepData: any) => {
    let currentId = sessionId;
    let currentToken = sessionToken;
    if (!currentId) {
      // Lazy init session if not exists
      const session = await initializeSession();
      if (!session) return false;
      currentId = session.id;
      currentToken = session.sessionToken ?? null;
    }

    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (currentToken) headers['X-Session-Token'] = currentToken;

      const res = await fetch(`${API_BASE}/api/onboarding/session/${currentId}/update`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ step, data: stepData }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          localStorage.removeItem('pawwiz_onboarding_session_token');
          setSessionId(null);
          setSessionToken(null);
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to submit step ${step}`);
      }

      const data = await res.json();
      setSessionStep(data.step);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [sessionId, sessionToken, initializeSession]);

  const resetSession = useCallback(() => {
    localStorage.removeItem('pawwiz_onboarding_session_id');
    localStorage.removeItem('pawwiz_onboarding_session_token');
    localStorage.removeItem('pawwiz_pending_cats');
    localStorage.removeItem('pawwiz_cats_added');
    localStorage.removeItem('pawwiz_cats_count');
    localStorage.removeItem('pawwiz_custom_cats_count');
    setSessionId(null);
    setSessionToken(null);
    setSessionStep(1);
    setOwnerName('');
    setOwnerEmail('');
    setCatsCount('');
    setCustomCatsCount('');
    setCatName('');
    setCatBreed('');
    setCatMarking('');
    setCatSex('');
    setCatLifeStage('');
    setPendingCats([]);
  }, []);

  const sendOtp = useCallback(async (id: string): Promise<{ cooldownSeconds: number } | null> => {
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['X-Session-Token'] = sessionToken;

      const res = await fetch(`${API_BASE}/api/onboarding/session/${id}/send-otp`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          localStorage.removeItem('pawwiz_onboarding_session_token');
          setSessionId(null);
          setSessionToken(null);
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send OTP');
      }
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [sessionToken]);

  const checkEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) return false; // On error, optimistically allow progression
      const data = await res.json();
      return data.exists === true;
    } catch {
      return false; // Network failure — optimistically allow progression
    }
  }, []);

  const verifyOtp = useCallback(async (id: string, code: string): Promise<boolean> => {
    setError(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionToken) headers['X-Session-Token'] = sessionToken;

      const res = await fetch(`${API_BASE}/api/onboarding/session/${id}/verify-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          localStorage.removeItem('pawwiz_onboarding_session_token');
          setSessionId(null);
          setSessionToken(null);
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to verify OTP');
      }
      const data = await res.json();
      setSessionStep(data.step);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [sessionToken]);

  const addPendingCat = useCallback((cat: {
    catName: string;
    catBreed: string;
    catMarking: string;
    catSex: string;
    catLifeStage: string;
  }) => {
    setPendingCats((prev) => {
      const next = [...prev, cat];
      localStorage.setItem('pawwiz_pending_cats', JSON.stringify(next));
      return next;
    });
  }, []);

  return {
    sessionId,
    sessionToken,
    sessionStep,
    loading,
    error,
    ownerName,
    setOwnerName,
    ownerEmail,
    setOwnerEmail,
    catsCount,
    setCatsCount: setCatsCountPersisted,
    customCatsCount,
    setCustomCatsCount: setCustomCatsCountPersisted,
    catName,
    setCatName,
    catBreed,
    setCatBreed,
    catMarking,
    setCatMarking,
    catSex,
    setCatSex,
    catLifeStage,
    setCatLifeStage,
    initializeSession,
    fetchSession,
    submitStep,
    sendOtp,
    verifyOtp,
    checkEmail,
    resetSession,
    pendingCats,
    setPendingCats,
    addPendingCat,
  };
}
