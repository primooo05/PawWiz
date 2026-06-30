import { useState, useCallback } from 'react';
import { API_BASE } from '../lib/config.js';

export function useOnboarding() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const val = localStorage.getItem('pawwiz_onboarding_session_id');
    return (val === 'null' || val === 'undefined') ? null : val;
  });
  const [sessionStep, setSessionStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [catsCount, setCatsCount] = useState('');
  const [customCatsCount, setCustomCatsCount] = useState('');
  const [catName, setCatName] = useState('');
  const [catBreed, setCatBreed] = useState('');
  const [catMarking, setCatMarking] = useState('');
  const [catSex, setCatSex] = useState('');
  const [catLifeStage, setCatLifeStage] = useState('');

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
      setCatsCount(data.catsCount || '');
      setCustomCatsCount(data.customCatsCount || '');
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
    if (!currentId) {
      // Lazy init session if not exists
      const session = await initializeSession();
      if (!session) return false;
      currentId = session.id;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/session/${currentId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, data: stepData }),
      });

      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          setSessionId(null);
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
  }, [sessionId, initializeSession]);

  const resetSession = useCallback(() => {
    localStorage.removeItem('pawwiz_onboarding_session_id');
    setSessionId(null);
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
  }, []);

  const sendOtp = useCallback(async (id: string): Promise<{ cooldownSeconds: number } | null> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/session/${id}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          setSessionId(null);
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send OTP');
      }
      return await res.json();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(async (id: string, code: string): Promise<boolean> => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/onboarding/session/${id}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        if (res.status === 404) {
          localStorage.removeItem('pawwiz_onboarding_session_id');
          setSessionId(null);
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
  }, []);

  return {
    sessionId,
    sessionStep,
    loading,
    error,
    ownerName,
    setOwnerName,
    ownerEmail,
    setOwnerEmail,
    catsCount,
    setCatsCount,
    customCatsCount,
    setCustomCatsCount,
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
    resetSession,
  };
}
