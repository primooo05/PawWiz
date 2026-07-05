import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { API_BASE } from '../../lib/config.js';

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
  hasNoProfile: boolean;
}

export function useProfilePanel(optimisticData?: { displayName: string; catName: string }): UseProfilePanelReturn {
  const [profile, setProfile] = useState<ProfileData | null>(
    optimisticData ? { ...optimisticData, catBreed: null, catMarking: null, catSex: '', catLifeStage: '' } : null
  );
  const [isLoading, setIsLoading] = useState(!optimisticData);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasNoProfile, setHasNoProfile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async (accessToken: string) => {
      const res = await fetch(`${API_BASE}/api/profile`, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
      });

      if (!cancelled) {
        setIsLoading(false);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else if (res.status === 404) {
          setHasNoProfile(true);
        }
        // On failure: profile stays as optimistic data or null → CTA state shown
      }
    };

    // getSession() can return a stale/expired token on first mount.
    // refreshSession() ensures we have a valid, up-to-date token before fetching.
    const init = async () => {
      const { data: { session } } = await supabase.auth.refreshSession();

      if (!session) {
        if (!cancelled) { setIsAuthenticated(false); setIsLoading(false); }
        return;
      }

      if (!cancelled) {
        setIsAuthenticated(true);
        await fetchProfile(session.access_token);
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  return { profile, isLoading, isAuthenticated, hasNoProfile };
}
