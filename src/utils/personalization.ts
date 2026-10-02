import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '../types/football';

const STORAGE_KEY = 'optalive_user_preferences';
const LEGACY_TEAMS_KEY = 'optalive_favourite_teams';
const PREFERENCES_EVENT = 'optalive_preferences_changed';

const DEFAULT_PREFERENCES: UserPreferences = {
  favouriteTeamIds: ['mci', 'rma', 'ars'],
  favouriteLeagueIds: ['epl', 'ucl', 'laliga'],
  favouritePlayerIds: ['p-haaland', 'p-saka', 'p-mbappe'],
  recentSearches: ['Erling Haaland', 'Arsenal', 'Premier League', 'Real Madrid'],
  prioritizeFavoritesOnHome: true,
};

/**
 * Safe retrieval of non-sensitive local preferences.
 * Strictly avoids storing API credentials or authentication tokens.
 */
export function getStoredPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check legacy teams key if available
      const legacyRaw = localStorage.getItem(LEGACY_TEAMS_KEY);
      if (legacyRaw) {
        try {
          const parsedLegacy = JSON.parse(legacyRaw);
          if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
            const initial: UserPreferences = {
              ...DEFAULT_PREFERENCES,
              favouriteTeamIds: parsedLegacy.map(String)
            };
            savePreferences(initial);
            return initial;
          }
        } catch {
          // ignore
        }
      }
      savePreferences(DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw);
    return {
      favouriteTeamIds: Array.isArray(parsed.favouriteTeamIds) ? parsed.favouriteTeamIds : DEFAULT_PREFERENCES.favouriteTeamIds,
      favouriteLeagueIds: Array.isArray(parsed.favouriteLeagueIds) ? parsed.favouriteLeagueIds : DEFAULT_PREFERENCES.favouriteLeagueIds,
      favouritePlayerIds: Array.isArray(parsed.favouritePlayerIds) ? parsed.favouritePlayerIds : DEFAULT_PREFERENCES.favouritePlayerIds,
      recentSearches: Array.isArray(parsed.recentSearches) ? parsed.recentSearches : DEFAULT_PREFERENCES.recentSearches,
      prioritizeFavoritesOnHome: typeof parsed.prioritizeFavoritesOnHome === 'boolean' ? parsed.prioritizeFavoritesOnHome : true,
    };
  } catch (err) {
    console.warn('[Personalization] Failed to read preferences from localStorage:', err);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Safe persistence of non-sensitive preferences.
 */
export function savePreferences(preferences: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    // Keep legacy key in sync for clubs
    localStorage.setItem(LEGACY_TEAMS_KEY, JSON.stringify(preferences.favouriteTeamIds));
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT, { detail: preferences }));
  } catch (err) {
    console.warn('[Personalization] Failed to save preferences to localStorage:', err);
  }
}

export function toggleFavouriteTeamAction(teamId: string): boolean {
  const current = getStoredPreferences();
  const normalizedId = teamId.toLowerCase();
  const exists = current.favouriteTeamIds.map(id => id.toLowerCase()).includes(normalizedId);
  const updatedTeams = exists
    ? current.favouriteTeamIds.filter(id => id.toLowerCase() !== normalizedId)
    : [...current.favouriteTeamIds, teamId];

  savePreferences({
    ...current,
    favouriteTeamIds: updatedTeams
  });
  return !exists;
}

export function toggleFavouriteLeagueAction(leagueId: string): boolean {
  const current = getStoredPreferences();
  const normalizedId = leagueId.toLowerCase();
  const exists = current.favouriteLeagueIds.map(id => id.toLowerCase()).includes(normalizedId);
  const updatedLeagues = exists
    ? current.favouriteLeagueIds.filter(id => id.toLowerCase() !== normalizedId)
    : [...current.favouriteLeagueIds, leagueId];

  savePreferences({
    ...current,
    favouriteLeagueIds: updatedLeagues
  });
  return !exists;
}

export function toggleFavouritePlayerAction(playerId: string): boolean {
  const current = getStoredPreferences();
  const normalizedId = playerId.toLowerCase();
  const exists = current.favouritePlayerIds.map(id => id.toLowerCase()).includes(normalizedId);
  const updatedPlayers = exists
    ? current.favouritePlayerIds.filter(id => id.toLowerCase() !== normalizedId)
    : [...current.favouritePlayerIds, playerId];

  savePreferences({
    ...current,
    favouritePlayerIds: updatedPlayers
  });
  return !exists;
}

export function addRecentSearchAction(query: string): void {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return;

  const current = getStoredPreferences();
  // Filter out exact duplicate (case insensitive) and prepend
  const filtered = current.recentSearches.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...filtered].slice(0, 10);

  savePreferences({
    ...current,
    recentSearches: updated
  });
}

export function removeRecentSearchAction(query: string): void {
  const current = getStoredPreferences();
  const updated = current.recentSearches.filter(
    (item) => item.toLowerCase() !== query.toLowerCase()
  );
  savePreferences({
    ...current,
    recentSearches: updated
  });
}

export function clearRecentSearchesAction(): void {
  const current = getStoredPreferences();
  savePreferences({
    ...current,
    recentSearches: []
  });
}

export function setPrioritizeFavoritesOnHomeAction(enabled: boolean): void {
  const current = getStoredPreferences();
  savePreferences({
    ...current,
    prioritizeFavoritesOnHome: enabled
  });
}

/**
 * React hook to bind any component to real-time non-sensitive preferences
 */
export function usePersonalization() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => getStoredPreferences());

  useEffect(() => {
    const handleUpdate = () => {
      setPreferences(getStoredPreferences());
    };

    window.addEventListener(PREFERENCES_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(PREFERENCES_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isFavouriteTeam = useCallback(
    (teamId?: string): boolean => {
      if (!teamId) return false;
      return preferences.favouriteTeamIds.map(id => id.toLowerCase()).includes(teamId.toLowerCase());
    },
    [preferences.favouriteTeamIds]
  );

  const isFavouriteLeague = useCallback(
    (leagueId?: string): boolean => {
      if (!leagueId) return false;
      return preferences.favouriteLeagueIds.map(id => id.toLowerCase()).includes(leagueId.toLowerCase());
    },
    [preferences.favouriteLeagueIds]
  );

  const isFavouritePlayer = useCallback(
    (playerId?: string): boolean => {
      if (!playerId) return false;
      return preferences.favouritePlayerIds.map(id => id.toLowerCase()).includes(playerId.toLowerCase());
    },
    [preferences.favouritePlayerIds]
  );

  const toggleFavouriteTeam = useCallback((teamId: string) => {
    return toggleFavouriteTeamAction(teamId);
  }, []);

  const toggleFavouriteLeague = useCallback((leagueId: string) => {
    return toggleFavouriteLeagueAction(leagueId);
  }, []);

  const toggleFavouritePlayer = useCallback((playerId: string) => {
    return toggleFavouritePlayerAction(playerId);
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    addRecentSearchAction(query);
  }, []);

  const removeRecentSearch = useCallback((query: string) => {
    removeRecentSearchAction(query);
  }, []);

  const clearRecentSearches = useCallback(() => {
    clearRecentSearchesAction();
  }, []);

  const setPrioritizeFavoritesOnHome = useCallback((enabled: boolean) => {
    setPrioritizeFavoritesOnHomeAction(enabled);
  }, []);

  return {
    preferences,
    favouriteTeamIds: preferences.favouriteTeamIds,
    favouriteLeagueIds: preferences.favouriteLeagueIds,
    favouritePlayerIds: preferences.favouritePlayerIds,
    recentSearches: preferences.recentSearches,
    prioritizeFavoritesOnHome: preferences.prioritizeFavoritesOnHome,
    isFavouriteTeam,
    isFavouriteLeague,
    isFavouritePlayer,
    toggleFavouriteTeam,
    toggleFavouriteLeague,
    toggleFavouritePlayer,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    setPrioritizeFavoritesOnHome
  };
}
