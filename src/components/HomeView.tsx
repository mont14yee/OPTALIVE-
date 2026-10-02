import React, { useState, useEffect, useMemo } from 'react';
import { Competition, Fixture, LeagueStandings, NewsArticle } from '../types/football';
import { footballClient } from '../api/footballClient';
import { usePersonalization } from '../utils/personalization';

interface HomeViewProps {
  competitions: Competition[];
  fixtures: Fixture[];
  onSelectFixture: (fixture: Fixture) => void;
  onSelectCompetition: (competitionId: string) => void;
  onSelectTeam: (teamId: string) => void;
  onNavigateTab: (tab: 'home' | 'live' | 'matches' | 'leagues' | 'news') => void;
  onOpenFavourites?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  competitions,
  fixtures,
  onSelectFixture,
  onSelectCompetition,
  onSelectTeam,
  onNavigateTab,
  onOpenFavourites
}) => {
  const [standings, setStandings] = useState<LeagueStandings | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const {
    favouriteTeamIds,
    prioritizeFavoritesOnHome,
    isFavouriteTeam,
    setPrioritizeFavoritesOnHome
  } = usePersonalization();

  const fixtureInvolvesFavourite = (f: Fixture) => {
    return isFavouriteTeam(f.homeTeam?.id) || isFavouriteTeam(f.awayTeam?.id);
  };

  // Filter and prioritize live matches
  const liveMatches = useMemo(() => {
    const raw = fixtures.filter((f) => f.isLive || f.status === 'LIVE' || f.status === 'HT');
    if (!prioritizeFavoritesOnHome) return raw;
    return [...raw].sort((a, b) => {
      const aFav = fixtureInvolvesFavourite(a) ? 1 : 0;
      const bFav = fixtureInvolvesFavourite(b) ? 1 : 0;
      return bFav - aFav;
    });
  }, [fixtures, prioritizeFavoritesOnHome, favouriteTeamIds]);

  // Featured match: if prioritizing favourites, pick a live or upcoming favourite match first
  const featuredMatch = useMemo(() => {
    if (prioritizeFavoritesOnHome) {
      const liveFav = liveMatches.find((f) => fixtureInvolvesFavourite(f));
      if (liveFav) return liveFav;
      const anyFav = fixtures.find((f) => fixtureInvolvesFavourite(f));
      if (anyFav) return anyFav;
    }
    return liveMatches[0] || fixtures[0] || null;
  }, [liveMatches, fixtures, prioritizeFavoritesOnHome, favouriteTeamIds]);

  // Today's matches slate: sorted or prioritized based on user preferences
  const todaysMatches = useMemo(() => {
    if (!prioritizeFavoritesOnHome) return fixtures.slice(0, 6);
    const sorted = [...fixtures].sort((a, b) => {
      const aFav = fixtureInvolvesFavourite(a) ? 1 : 0;
      const bFav = fixtureInvolvesFavourite(b) ? 1 : 0;
      return bFav - aFav;
    });
    return sorted.slice(0, 6);
  }, [fixtures, prioritizeFavoritesOnHome, favouriteTeamIds]);

  // Matches involving user's favourite clubs today
  const favouriteMatchesToday = useMemo(() => {
    return fixtures.filter((f) => fixtureInvolvesFavourite(f));
  }, [fixtures, favouriteTeamIds]);

  useEffect(() => {
    let isMounted = true;
    Promise.allSettled([
      footballClient.getStandings('epl'),
      footballClient.getNews()
    ]).then(([standingsRes, newsRes]) => {
      if (!isMounted) return;
      if (standingsRes.status === 'fulfilled') setStandings(standingsRes.value);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.slice(0, 3));
      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Personalization Status & Priority Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-white/10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 ${
            prioritizeFavoritesOnHome ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 'bg-white/5 text-slate-400 border border-white/10'
          }`}>
            <i className="fa-solid fa-star"></i>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-display font-bold text-white truncate">
                {prioritizeFavoritesOnHome ? 'Prioritizing Favourite Clubs' : 'Standard Chronological Feed'}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold flex-shrink-0">
                {favouriteTeamIds.length} clubs tracked
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 truncate">
              {prioritizeFavoritesOnHome
                ? 'Tracked clubs are elevated to top of live telemetry and match calendar'
                : 'All fixtures shown across standard tournament schedules'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <button
            onClick={() => setPrioritizeFavoritesOnHome(!prioritizeFavoritesOnHome)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer min-h-[38px] flex items-center gap-1.5 ${
              prioritizeFavoritesOnHome
                ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            <i className={`fa-solid ${prioritizeFavoritesOnHome ? 'fa-check' : 'fa-star text-amber-400'}`}></i>
            <span>{prioritizeFavoritesOnHome ? 'Priority On' : 'Prioritize Clubs'}</span>
          </button>

          {onOpenFavourites && (
            <button
              onClick={onOpenFavourites}
              aria-label="Manage favourite clubs"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer min-h-[38px]"
            >
              Edit Clubs
            </button>
          )}
        </div>
      </div>

      {/* 1. In-Play Live Marquee Strip */}
      <section aria-labelledby="live-ticker-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <h2 id="live-ticker-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              In-Play Live Telemetry
            </h2>
            {liveMatches.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                {liveMatches.length} LIVE
              </span>
            )}
          </div>
          <button
            onClick={() => onNavigateTab('live')}
            className="text-xs font-mono text-[var(--primary-color)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Live Center</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        {liveMatches.length === 0 ? (
          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-slate-400">
              <i className="fa-solid fa-satellite-dish text-slate-500"></i>
              <span>No live matches in play at this second. Scheduled matches available below.</span>
            </div>
            <button
              onClick={() => onNavigateTab('matches')}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono text-center cursor-pointer transition-colors"
            >
              Browse Match Calendar →
            </button>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {liveMatches.map((m) => {
              const isFav = fixtureInvolvesFavourite(m);
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectFixture(m)}
                  className={`flex-shrink-0 w-72 sm:w-80 p-3.5 rounded-2xl bg-slate-900/80 transition-all cursor-pointer shadow-lg space-y-2.5 ${
                    isFav
                      ? 'border border-amber-400/50 hover:border-amber-400 shadow-amber-400/5'
                      : 'border border-red-500/30 hover:border-red-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-slate-400 truncate max-w-[120px]">{m.competition?.name}</span>
                      {isFav && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 flex items-center gap-1">
                          <i className="fa-solid fa-star text-[8px]"></i> PINNED
                        </span>
                      )}
                    </div>
                    <span className="text-red-400 font-bold flex items-center gap-1 flex-shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      {m.status === 'HT' ? 'HT' : `${m.minute}'`}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {m.homeTeam?.logoUrl && (
                          <img src={m.homeTeam.logoUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                        )}
                        <span className="text-xs font-display font-bold text-white truncate">{m.homeTeam?.name}</span>
                      </div>
                      <span className="text-sm font-mono font-black text-white">{m.score?.home ?? 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        {m.awayTeam?.logoUrl && (
                          <img src={m.awayTeam.logoUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                        )}
                        <span className="text-xs font-display font-bold text-white truncate">{m.awayTeam?.name}</span>
                      </div>
                      <span className="text-sm font-mono font-black text-white">{m.score?.away ?? 0}</span>
                    </div>
                  </div>

                  {m.statistics?.xG && (
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>xG: {m.statistics.xG.home} - {m.statistics.xG.away}</span>
                      <span className="text-[var(--primary-color)] font-semibold">Tap for telemetry →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 2. Featured Match Spotlight */}
      {featuredMatch && (
        <section aria-labelledby="featured-match-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="featured-match-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i className="fa-solid fa-star text-[var(--primary-color)]"></i>
              Opta Marquee Spotlight
            </h2>
            <span className="text-[11px] font-mono text-slate-500">{featuredMatch.competition?.name}</span>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-slate-900/70 border border-white/15 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
            {/* Top row: Tournament & Status */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-6">
              <div className="flex items-center gap-2">
                {featuredMatch.competition?.logoUrl && (
                  <img src={featuredMatch.competition.logoUrl} alt="" className="w-4 h-4 object-contain" />
                )}
                <span className="font-semibold text-white">{featuredMatch.competition?.name}</span>
                {featuredMatch.round && <span>· {featuredMatch.round}</span>}
              </div>

              {featuredMatch.isLive ? (
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                  {featuredMatch.minute}' LIVE
                </span>
              ) : featuredMatch.status === 'FT' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold">
                  FULL TIME
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--primary-color)] font-bold">
                  {new Date(featuredMatch.startingAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Duel Score Board */}
            <div className="grid grid-cols-3 items-center text-center gap-2 max-w-xl mx-auto my-4">
              {/* Home Team */}
              <div 
                onClick={() => onSelectTeam(featuredMatch.homeTeam.id)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-black/40 border border-white/10 p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  {featuredMatch.homeTeam?.logoUrl ? (
                    <img src={featuredMatch.homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <i className="fa-solid fa-shield text-slate-500 text-xl"></i>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] transition-colors truncate max-w-full">
                  {featuredMatch.homeTeam?.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Home</span>
              </div>

              {/* Center Score / Versus */}
              <div className="flex flex-col items-center justify-center">
                {featuredMatch.status === 'NS' ? (
                  <div className="text-center space-y-1">
                    <span className="text-2xl sm:text-3xl font-display font-black text-slate-400">VS</span>
                    <span className="block text-[10px] font-mono text-slate-500">
                      {new Date(featuredMatch.startingAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <span className="text-3xl sm:text-5xl font-mono font-black text-white tracking-tight">
                      {featuredMatch.score?.home ?? 0} - {featuredMatch.score?.away ?? 0}
                    </span>
                    {featuredMatch.statistics?.xG && (
                      <span className="block text-[10px] font-mono text-slate-400">
                        xG {featuredMatch.statistics.xG.home} - {featuredMatch.statistics.xG.away}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div 
                onClick={() => onSelectTeam(featuredMatch.awayTeam.id)}
                className="flex flex-col items-center gap-2 cursor-pointer group"
              >
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-black/40 border border-white/10 p-2.5 flex items-center justify-center group-hover:scale-105 transition-transform shadow-lg">
                  {featuredMatch.awayTeam?.logoUrl ? (
                    <img src={featuredMatch.awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                  ) : (
                    <i className="fa-solid fa-shield text-slate-500 text-xl"></i>
                  )}
                </div>
                <span className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] transition-colors truncate max-w-full">
                  {featuredMatch.awayTeam?.name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Away</span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <i className="fa-solid fa-location-dot text-slate-500"></i>
                <span className="truncate">{featuredMatch.venue || 'Stadium Venue'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectFixture(featuredMatch)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[var(--primary-color)] text-black font-mono font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-opacity cursor-pointer text-center min-h-[44px] flex items-center justify-center gap-2"
                >
                  <span>Launch Match Center</span>
                  <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Tournament Quick Filter Pills */}
      <section aria-labelledby="tournaments-heading" className="space-y-3">
        <h2 id="tournaments-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
          Top Tournaments
        </h2>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {competitions.slice(0, 6).map((comp) => (
            <button
              key={comp.id}
              onClick={() => {
                onSelectCompetition(comp.id);
                onNavigateTab('leagues');
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-[var(--primary-color)]/50 transition-all cursor-pointer whitespace-nowrap min-h-[44px] group"
            >
              {comp.logoUrl && (
                <img src={comp.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
              )}
              <span className="text-xs font-display font-bold text-slate-200 group-hover:text-white">
                {comp.shortName || comp.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Two-Column Dashboard Grid: Matches Slate & Standings Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Matches Slate */}
        <section aria-labelledby="todays-matches-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 id="todays-matches-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <i className="fa-solid fa-calendar-day text-[var(--primary-color)]"></i>
                Match Slate Preview
              </h2>
              {favouriteMatchesToday.length > 0 && prioritizeFavoritesOnHome && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-star text-[8px]"></i>
                  {favouriteMatchesToday.length} Pinned
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('matches')}
              className="text-xs font-mono text-[var(--primary-color)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Schedule ({fixtures.length})</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <div className="space-y-2.5">
            {todaysMatches.map((f) => {
              const isLive = f.isLive || f.status === 'LIVE' || f.status === 'HT';
              const isFav = fixtureInvolvesFavourite(f);
              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFixture(f)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center justify-between gap-3 shadow-sm min-h-[52px] ${
                    isFav
                      ? 'bg-amber-400/5 hover:bg-amber-400/10 border border-amber-400/30 hover:border-amber-400/60'
                      : 'bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Home */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {f.homeTeam?.logoUrl && (
                      <img src={f.homeTeam.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                    )}
                    <span className={`text-xs font-display font-bold truncate ${isFavouriteTeam(f.homeTeam?.id) ? 'text-amber-300' : 'text-white'}`}>
                      {f.homeTeam?.name}
                    </span>
                    {isFavouriteTeam(f.homeTeam?.id) && (
                      <i className="fa-solid fa-star text-[9px] text-amber-400 flex-shrink-0" title="Pinned Club"></i>
                    )}
                  </div>

                  {/* Score or Kickoff Time */}
                  <div className="px-3 py-1 rounded-lg bg-black/40 border border-white/5 font-mono text-center flex-shrink-0 min-w-[70px]">
                    {isLive ? (
                      <span className="text-xs font-bold text-red-400">
                        {f.score?.home ?? 0} - {f.score?.away ?? 0}
                      </span>
                    ) : f.status === 'FT' ? (
                      <span className="text-xs font-bold text-white">
                        {f.score?.home ?? 0} - {f.score?.away ?? 0}
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400">
                        {new Date(f.startingAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  {/* Away */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    {isFavouriteTeam(f.awayTeam?.id) && (
                      <i className="fa-solid fa-star text-[9px] text-amber-400 flex-shrink-0" title="Pinned Club"></i>
                    )}
                    <span className={`text-xs font-display font-bold truncate text-right ${isFavouriteTeam(f.awayTeam?.id) ? 'text-amber-300' : 'text-white'}`}>
                      {f.awayTeam?.name}
                    </span>
                    {f.awayTeam?.logoUrl && (
                      <img src={f.awayTeam.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Premier League Standings Spotlight */}
        <section aria-labelledby="standings-spotlight-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="standings-spotlight-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <i className="fa-solid fa-trophy text-amber-400"></i>
              Premier League Top Flight
            </h2>
            <button
              onClick={() => onNavigateTab('leagues')}
              className="text-xs font-mono text-[var(--primary-color)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Tables</span>
              <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/10 overflow-hidden shadow-sm">
            {loading || !standings ? (
              <div className="p-8 text-center text-xs font-mono text-slate-500 animate-pulse">
                Loading table telemetry...
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider bg-black/20">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Club</th>
                    <th className="py-2.5 px-2 text-center">PL</th>
                    <th className="py-2.5 px-2 text-center">GD</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.table.slice(0, 5).map((row) => (
                    <tr
                      key={row.position}
                      onClick={() => onSelectTeam(row.team.id)}
                      className="hover:bg-white/5 transition-colors cursor-pointer text-slate-300"
                    >
                      <td className="py-2.5 px-3 font-bold text-slate-400">{row.position}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {row.team?.logoUrl && (
                            <img src={row.team.logoUrl} alt="" className="w-4 h-4 object-contain flex-shrink-0" />
                          )}
                          <span className="font-bold text-white truncate hover:text-[var(--primary-color)] transition-colors">
                            {row.team?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-center text-slate-400">{row.played}</td>
                      <td className="py-2.5 px-2 text-center">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-white">{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* 5. Editorial News & Highlight Clips Spotlight */}
      <section aria-labelledby="news-spotlight-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="news-spotlight-heading" className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <i className="fa-solid fa-newspaper text-cyan-400"></i>
            Verified Opta News Wire
          </h2>
          <button
            onClick={() => onNavigateTab('news')}
            className="text-xs font-mono text-[var(--primary-color)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>All News & Clips</span>
            <i className="fa-solid fa-arrow-right text-[10px]"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {news.map((item) => (
            <div
              key={item.id}
              onClick={() => onNavigateTab('news')}
              className="p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="text-[var(--primary-color)] font-bold uppercase">{item.category}</span>
                  <span>{item.source}</span>
                </div>
                <h3 className="text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 font-sans leading-relaxed">
                  {item.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                <span className="group-hover:text-white transition-colors">Read Story →</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
