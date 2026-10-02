import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Fixture, Competition } from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { LiveMatchCard } from './LiveMatchCard';
import { MatchCenterModal } from './MatchCenterModal';

export type LiveCenterTab = 'live' | 'upcoming' | 'finished' | 'favorites';

interface LiveCenterProps {
  competitions?: Competition[];
  initialTab?: LiveCenterTab;
  onOpenMatchModal?: (fixture: Fixture) => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const LiveCenter: React.FC<LiveCenterProps> = ({
  competitions = [],
  initialTab = 'live',
  onOpenMatchModal,
  onSelectTeam,
  onSelectPlayer
}) => {
  const [activeTab, setActiveTab] = useState<LiveCenterTab>(initialTab);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isStaleData, setIsStaleData] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('optalive_fav_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Last update timestamp and second counter
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Keep ref to selected match ID to keep Match Center modal in sync without closing
  const selectedMatchIdRef = useRef<string | null>(null);
  selectedMatchIdRef.current = selectedMatch ? selectedMatch.id : null;

  // Save favorites changes
  const toggleFavorite = useCallback((fixtureId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(fixtureId)
        ? prev.filter((id) => id !== fixtureId)
        : [...prev, fixtureId];
      try {
        localStorage.setItem('optalive_fav_matches', JSON.stringify(next));
      } catch (err) {
        console.error('Failed to save favorites to localStorage:', err);
      }
      return next;
    });
  }, []);

  // Offline / Online listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // "Updated X seconds ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      setSecondsAgo(Math.max(0, elapsed));
    }, 1000);

    return () => clearInterval(timer);
  }, [lastUpdated]);

  // Merge updated fixtures into state without reloading whole page or resetting focus
  const mergeUpdatedFixtures = useCallback((incoming: Fixture[], isStale?: boolean) => {
    setFixtures((prev) => {
      if (prev.length === 0) return incoming;

      const incomingMap = new Map(incoming.map((f) => [f.id, f]));
      // Update existing fixtures only where data changed
      const merged = prev.map((oldF) => {
        const fresh = incomingMap.get(oldF.id);
        if (!fresh) return oldF;
        return fresh;
      });

      // Append any new fixtures that were not present previously
      incoming.forEach((f) => {
        if (!prev.some((p) => p.id === f.id)) {
          merged.push(f);
        }
      });

      return merged;
    });

    if (isStale !== undefined) {
      setIsStaleData(Boolean(isStale));
    }
    setLastUpdated(new Date());
    setSecondsAgo(0);
    setApiError(null);

    // Keep open modal in sync with live data
    if (selectedMatchIdRef.current) {
      const matchInFresh = incoming.find((f) => f.id === selectedMatchIdRef.current);
      if (matchInFresh) {
        setSelectedMatch(matchInFresh);
      }
    }
  }, []);

  // Fetch all matches from server API
  const fetchMatches = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await footballClient.getFixturesEnvelope(undefined, undefined, undefined);
      mergeUpdatedFixtures(res.data, res.meta?.isStale);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch match telemetry';
      console.warn('LiveCenter fetch error:', msg);
      setApiError(msg);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, [mergeUpdatedFixtures]);

  // Initial load
  useEffect(() => {
    fetchMatches(false);
  }, [fetchMatches]);

  // Automatic background live polling every 15 seconds (updates only changed data)
  useEffect(() => {
    const interval = setInterval(() => {
      // If offline, skip network poll
      if (!navigator.onLine) return;

      footballClient
        .getFixturesEnvelope(undefined, undefined, undefined)
        .then((res) => {
          mergeUpdatedFixtures(res.data, res.meta?.isStale);
        })
        .catch(() => {
          // Suppress non-critical background polling transient network errors
        });
    }, 15000);

    return () => clearInterval(interval);
  }, [mergeUpdatedFixtures]);

  // Categorize matches by status
  const liveMatches = useMemo(
    () =>
      fixtures.filter(
        (f) =>
          f.isLive ||
          f.status === 'LIVE' ||
          f.status === 'HT' ||
          f.status === 'AET' ||
          f.status === 'PEN'
      ),
    [fixtures]
  );

  const upcomingMatches = useMemo(
    () => fixtures.filter((f) => f.status === 'NS'),
    [fixtures]
  );

  const finishedMatches = useMemo(
    () =>
      fixtures.filter(
        (f) => f.status === 'FT' || f.status === 'PST' || f.status === 'CANC' || f.status === 'SUSP'
      ),
    [fixtures]
  );

  const favoriteMatches = useMemo(
    () => fixtures.filter((f) => favorites.includes(f.id)),
    [fixtures, favorites]
  );

  // Tab counts
  const tabCounts = useMemo(
    () => ({
      live: liveMatches.length,
      upcoming: upcomingMatches.length,
      finished: finishedMatches.length,
      favorites: favoriteMatches.length
    }),
    [liveMatches.length, upcomingMatches.length, finishedMatches.length, favoriteMatches.length]
  );

  // Filter based on active tab
  const tabFilteredMatches = useMemo(() => {
    switch (activeTab) {
      case 'live':
        return liveMatches;
      case 'upcoming':
        return upcomingMatches;
      case 'finished':
        return finishedMatches;
      case 'favorites':
        return favoriteMatches;
      default:
        return fixtures;
    }
  }, [activeTab, liveMatches, upcomingMatches, finishedMatches, favoriteMatches, fixtures]);

  // Secondary filters: Competition and Search Query
  const displayedMatches = useMemo(() => {
    return tabFilteredMatches.filter((match) => {
      // Competition filter
      if (selectedCompId !== 'all' && match.competition.id !== selectedCompId) {
        return false;
      }

      // Search query filter (teams, competition name, player names)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const homeName = match.homeTeam.name.toLowerCase();
        const awayName = match.awayTeam.name.toLowerCase();
        const compName = match.competition.name.toLowerCase();
        const eventsText = (match.events || []).map((e) => e.player.name.toLowerCase()).join(' ');

        return (
          homeName.includes(query) ||
          awayName.includes(query) ||
          compName.includes(query) ||
          eventsText.includes(query)
        );
      }

      return true;
    });
  }, [tabFilteredMatches, selectedCompId, searchQuery]);

  // Format "Updated X seconds ago" label
  const renderUpdatedLabel = () => {
    if (secondsAgo <= 1) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    const mins = Math.floor(secondsAgo / 60);
    return `Updated ${mins}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* Live Center Control Header */}
      <div className="bg-slate-900/60 p-4 md:p-5 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Header Title & Real-Time Sync Indicator */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary-color)]"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black uppercase text-base md:text-lg text-white tracking-wider">
                  Football Live Center
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  REAL-TIME TELEMETRY
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span>{renderUpdatedLabel()}</span>
                <span>•</span>
                <span className="text-[var(--primary-color)] font-semibold">
                  {liveMatches.length} In-Play
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar: Manual Refresh Button & Search Input */}
          <div className="flex items-center gap-2.5">
            {/* Search input */}
            <div className="relative flex-1 sm:w-60">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search club, league, or star..."
                className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={() => fetchMatches(true)}
              disabled={isRefreshing}
              title="Refresh match telemetry"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate text-xs ${isRefreshing ? 'animate-spin text-[var(--primary-color)]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Primary 4 Category Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-white/5">
          {[
            {
              id: 'live',
              label: 'LIVE NOW',
              icon: 'fa-solid fa-circle-dot',
              count: tabCounts.live,
              isLiveDot: true,
              activeColor: 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            },
            {
              id: 'upcoming',
              label: 'UPCOMING',
              icon: 'fa-regular fa-clock',
              count: tabCounts.upcoming,
              activeColor: 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border-[var(--primary-color)]/50'
            },
            {
              id: 'finished',
              label: 'FINISHED',
              icon: 'fa-solid fa-flag-checkered',
              count: tabCounts.finished,
              activeColor: 'bg-slate-800 text-white border-white/30'
            },
            {
              id: 'favorites',
              label: 'FAVOURITES',
              icon: 'fa-solid fa-star',
              count: tabCounts.favorites,
              activeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
            }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as LiveCenterTab)}
                className={`py-2.5 px-3 rounded-xl font-display font-bold uppercase text-xs md:text-sm tracking-wider transition-all flex items-center justify-between border cursor-pointer ${
                  isActive
                    ? tab.activeColor
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <i
                    className={`${tab.icon} text-xs ${
                      tab.isLiveDot && tab.count > 0 ? 'text-red-500 animate-pulse' : ''
                    }`}
                  />
                  <span className="truncate">{tab.label}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full ml-1.5 ${
                    isActive ? 'bg-black/30 font-bold' : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warning Banners: Offline, Stale Data, API Error */}
      {isOffline && (
        <div className="bg-amber-950/70 border border-amber-500/40 rounded-2xl p-3.5 flex items-center gap-3 text-amber-200 text-xs font-mono">
          <i className="fa-solid fa-wifi-slash text-base text-amber-400" />
          <div className="flex-1">
            <span className="font-bold">Offline Mode Active:</span> Device is currently disconnected from the internet. Displaying cached live match data.
          </div>
        </div>
      )}

      {isStaleData && !isOffline && (
        <div className="bg-blue-950/60 border border-blue-500/30 rounded-2xl p-3 flex items-center gap-3 text-blue-200 text-xs font-mono">
          <i className="fa-solid fa-server text-blue-400" />
          <div className="flex-1">
            <span className="font-bold">Upstream Feeds Reconnecting:</span> Serving verified cached telemetry until provider sync recovers.
          </div>
        </div>
      )}

      {apiError && (
        <div className="bg-rose-950/60 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 text-rose-200 text-xs font-mono">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm" />
            <span>Telemetry feed error: {apiError}</span>
          </div>
          <button
            onClick={() => fetchMatches(true)}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold uppercase transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Secondary League Filter Pills */}
      {competitions.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCompId('all')}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs cursor-pointer transition-all whitespace-nowrap ${
              selectedCompId === 'all'
                ? 'bg-white/20 text-white font-bold'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            All Competitions
          </button>
          {competitions.map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all whitespace-nowrap ${
                selectedCompId === comp.id
                  ? 'bg-white/20 text-white font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {comp?.logoUrl && (
                <img
                  src={comp.logoUrl}
                  alt={comp.name || 'Competition'}
                  className="w-3.5 h-3.5 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <span>{comp?.shortName || comp?.name || 'League'}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Match Grid or Empty / Loading States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl p-6 h-56 animate-pulse flex flex-col justify-between"
            >
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="space-y-3">
                <div className="h-6 bg-white/10 rounded w-4/5" />
                <div className="h-6 bg-white/10 rounded w-3/4" />
              </div>
              <div className="h-3 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : displayedMatches.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-white/5 space-y-3 p-6">
          <i
            className={`text-4xl text-slate-600 mb-2 ${
              activeTab === 'live'
                ? 'fa-solid fa-futbol'
                : activeTab === 'favorites'
                ? 'fa-solid fa-star'
                : activeTab === 'upcoming'
                ? 'fa-regular fa-calendar-xmark'
                : 'fa-solid fa-clock-rotate-left'
            }`}
          />
          <h3 className="font-display font-bold uppercase text-slate-200 text-base">
            {activeTab === 'live'
              ? 'No Live Matches In-Play'
              : activeTab === 'favorites'
              ? 'No Bookmarked Matches'
              : activeTab === 'upcoming'
              ? 'No Upcoming Fixtures Found'
              : 'No Finished Matches Found'}
          </h3>
          <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
            {activeTab === 'live'
              ? 'There are currently no active matches underway for this selection. Check Upcoming fixtures or switch competitions.'
              : activeTab === 'favorites'
              ? 'You have not added any matches to your favourites yet. Tap the star icon (⭐) on any match card to track it here.'
              : searchQuery
              ? `No matches matched your search query "${searchQuery}".`
              : 'No fixtures match the selected filter criteria.'}
          </p>

          {activeTab === 'live' && (
            <button
              onClick={() => setActiveTab('upcoming')}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--primary-color)] text-black font-display font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
            >
              <i className="fa-regular fa-clock" />
              Browse Upcoming Fixtures
            </button>
          )}
        </div>
      ) : (
        /* Live Match Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedMatches.map((match) => (
            <LiveMatchCard
              key={match.id}
              fixture={match}
              isFavorite={favorites.includes(match.id)}
              onToggleFavorite={toggleFavorite}
              onSelect={(fixture) => setSelectedMatch(fixture)}
            />
          ))}
        </div>
      )}

      {/* Match Center Full Modal (Opened on Card Click) */}
      {selectedMatch && (
        <MatchCenterModal
          fixture={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSelectTeam={(teamId) => {
            setSelectedMatch(null);
            if (onSelectTeam) onSelectTeam(teamId);
          }}
          onSelectPlayer={(playerId) => {
            setSelectedMatch(null);
            if (onSelectPlayer) onSelectPlayer(playerId);
          }}
        />
      )}
    </div>
  );
};
