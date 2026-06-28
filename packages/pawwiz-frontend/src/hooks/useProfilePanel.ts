import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ProfileData {
  displayName: string;
  catName: string;
  catBreed: string | null;
  catMarking: string | null;
  catSex: string;
  catLifeStage: string;
}

interface UseProfilePanelReturn {
  profile: ProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useProfilePanel(optimisticData?: { displayName: string; catName: string }): UseProfilePanelReturn {
  const [profile, setProfile] = useState<ProfileData | null>(
    optimisticData ? { ...optimisticData, catBreed: null, catMarking: null, catSex: '', catLifeStage: '' } : null
  );
  const [isLoading, setIsLoading] = useState(!optimisticData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) { setIsAuthenticated(false); setIsLoading(false); }
        return;
      }
      if (!cancelled) setIsAuthenticated(true);

      const API_BASE = window.location.port === '5173' ? 'http://localhost:3001' : '';
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });

      if (!cancelled) {
        setIsLoading(false);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
        // On failure: profile stays as optimistic data or null → CTA state shown
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, []);

  return { profile, isLoading, isAuthenticated };
}
