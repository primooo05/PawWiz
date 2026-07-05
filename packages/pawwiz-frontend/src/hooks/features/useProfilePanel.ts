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

/**
 * Module-level cache — persists for the lifetime of the JS module (i.e. the browser tab).
 *
 * Problem it solves (Issue 5 + 6 from HAR report):
 *   - GET /api/profile was 323ms on localhost (Supabase JWT verify + Prisma query each time).
 *   - The hook was called independently by Dashboard, BehaviorChat, PregnancyTracker,
 *     PregnancySection, and DietSetupView — each triggering a separate refreshSession()
 *     (130ms Supabase round-trip) THEN a separate /api/profile fetch (323ms).
 *   - With the cache, the API is hit exactly once per tab session; every subsequent
 *     mount of any component using this hook reads from memory synchronously.
 *
 * Cache is invalidated on sign-out (Supabase auth state change → 'SIGNED_OUT' event).
 */
let _cachedProfile: ProfileData | null = null;
let _cachedIsAuthenticated: boolean | null = null;
let _cachedHasNoProfile: boolean = false;
let _fetchPromise: Promise<void> | null = null;

/** Call this on sign-out so the next sign-in fetches fresh data. */
export function invalidateProfileCache() {
  _cachedProfile = null;
  _cachedIsAuthenticated = null;
  _cachedHasNoProfile = false;
  _fetchPromise = null;
}

async function fetchAndCacheProfile(): Promise<void> {
  // refreshSession ensures the token is valid; fires the Supabase /token round-trip once.
  const { data: { session } } = await supabase.auth.refreshSession();

  if (!session) {
    _cachedIsAuthenticated = false;
    return;
  }

  _cachedIsAuthenticated = true;

  const res = await fetch(`${API_BASE}/api/profile`, {
    headers: { 'Authorization': `Bearer ${session.access_token}` },
  });

  if (res.ok) {
    _cachedProfile = await res.json() as ProfileData;
  } else if (res.status === 404) {
    _cachedHasNoProfile = true;
  }
  // On any other failure: cache stays null — components fall through to their CTA/error state.
}

export function useProfilePanel(optimisticData?: { displayName: string; catName: string }): UseProfilePanelReturn {
  // If we already have a cached result, initialise state synchronously — no loading flash.
  const hasCachedResult = _cachedIsAuthenticated !== null;

  const [profile, setProfile] = useState<ProfileData | null>(
    hasCachedResult ? _cachedProfile
    : optimisticData ? { ...optimisticData, catBreed: null, catMarking: null, catSex: '', catLifeStage: '' }
    : null
  );
  const [isLoading, setIsLoading] = useState(!hasCachedResult && !optimisticData);
  const [isAuthenticated, setIsAuthenticated] = useState(_cachedIsAuthenticated ?? false);
  const [hasNoProfile, setHasNoProfile] = useState(_cachedHasNoProfile);

  useEffect(() => {
    // Already resolved — nothing to do.
    if (hasCachedResult) return;

    let cancelled = false;

    // Re-use an in-flight request if another instance of this hook triggered it first
    // (e.g. two components mounting in the same render cycle both call useProfilePanel).
    if (!_fetchPromise) {
      _fetchPromise = fetchAndCacheProfile();
    }

    _fetchPromise.then(() => {
      if (cancelled) return;
      setIsAuthenticated(_cachedIsAuthenticated ?? false);
      setProfile(_cachedProfile);
      setHasNoProfile(_cachedHasNoProfile);
      setIsLoading(false);
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalidate cache on sign-out so a fresh login fetches the correct profile.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        invalidateProfileCache();
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return { profile, isLoading, isAuthenticated, hasNoProfile };
}
