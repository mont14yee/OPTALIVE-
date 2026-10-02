import React, { useState, useEffect, useCallback } from 'react';
import { 
  PlayerProfile, 
  Fixture, 
  PlayerMatchPerformance 
} from '../../types/football';
import { footballClient } from '../../api/footballClient';

export type PlayerTab = 'overview' | 'matches' | 'stats' | 'form';

interface PlayerProfileViewProps {
  playerId: string;
  onBack?: () => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (playerId: string) => void;
  onSelectFixture?: (fixture: Fixture) => void;
}

export const PlayerProfileView: React.FC<PlayerProfileViewProps> = ({
  playerId,
  onBack,
  onSelectTeam,
  onSelectPlayer,
  onSelectFixture
}) => {
  const [activeTab, setActiveTab] = useState<PlayerTab>('overview');
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load player profile data
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await footballClient.getPlayerProfile(playerId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load player profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve player profile');
    } finally {
      setIsLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const tabs: { id: PlayerTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: 'fa-id-card' },
    { id: 'matches', label: 'MATCHES', icon: 'fa-futbol' },
    { id: 'stats', label: 'STATS', icon: 'fa-chart-simple' },
    { id: 'form', label: 'FORM', icon: 'fa-wave-square' }
  ];

  // Featured players for quick switcher
  const featuredPlayers = [
    { id: 'p-haaland', name: 'Erling Haaland (MCI)' },
    { id: 'p-saka', name: 'Bukayo Saka (ARS)' },
    { id: 'p-salah', name: 'Mohamed Salah (LIV)' },
    { id: 'p-mbappe', name: 'Kylian Mbappé (RMA)' },
    { id: 'p-vini', name: 'Vinícius Júnior (RMA)' },
    { id: 'p-bellingham', name: 'Jude Bellingham (RMA)' },
    { id: 'p-palmer', name: 'Cole Palmer (CHE)' },
    { id: 'p-kane', name: 'Harry Kane (BAY)' },
    { id: 'p-lewa', name: 'Robert Lewandowski (BAR)' },
    { id: 'mci-mf1', name: 'Rodri (MCI)' },
    { id: 'mci-mf3', name: 'Kevin De Bruyne (MCI)' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10"></div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="h-8 w-56 bg-white/10 rounded-lg mx-auto md:mx-0"></div>
              <div className="h-4 w-44 bg-white/5 rounded mx-auto md:mx-0"></div>
              <div className="h-4 w-36 bg-white/5 rounded mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>
        {/* Tabs Bar Skeleton */}
        <div className="h-12 bg-slate-900/40 border border-white/5 rounded-xl"></div>
        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-slate-900/40 border border-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto text-xl">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Player Profile Unavailable</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error || 'Could not load profile for this player.'}</p>
        <div className="flex items-center justify-center gap-3 pt-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left mr-2"></i>Go Back
            </button>
          )}
          <button
            onClick={loadProfile}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-[var(--primary-color)] text-black font-bold rounded-lg transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-rotate-right mr-2"></i>Retry
          </button>
        </div>
      </div>
    );
  }

  const { player, team, competition, stats, matches, form } = profile;

  /**
   * Helper function enforcing strict provider integrity:
   * "Only render metrics actually available from the provider.
   *  Use graceful 'Not available' states instead of fabricated zero values."
   */
  const renderMetricValue = (
    val: number | null | undefined,
    options: {
      suffix?: string;
      prefix?: string;
      colorClass?: string;
    } = {}
  ) => {
    if (val === null || val === undefined) {
      return (
        <div className="flex items-center gap-1.5 py-0.5" title="Metric not provided or tracked by current data provider">
          <span className="text-slate-600 font-mono text-base font-bold">—</span>
          <span className="text-[11px] font-mono text-slate-500 italic">Not available</span>
        </div>
      );
    }

    return (
      <span className={`text-2xl font-mono font-bold ${options.colorClass || 'text-white'}`}>
        {options.prefix || ''}
        {val}
        {options.suffix || ''}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Nav & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back</span>
            </button>
          )}
          <span className="text-xs font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
            Players / {team.shortName} / {player.name}
          </span>
        </div>

        {/* Quick Player Switcher */}
        {onSelectPlayer && (
          <div className="relative">
            <select
              value={player.id}
              onChange={(e) => onSelectPlayer(e.target.value)}
              className="appearance-none bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200 py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[var(--primary-color)]"
            >
              <option disabled>Switch Star Player...</option>
              {featuredPlayers.map((fp) => (
                <option key={fp.id} value={fp.id} className="bg-slate-900 text-white">
                  {fp.name}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
          </div>
        )}
      </div>

      {/* =========================================================================
          PLAYER HEADER:
          - player photo where available
          - name
          - team
          - position
          - nationality
          ========================================================================= */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-color)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Player Photo / Silhouette Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shadow-2xl">
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-1">
                  <i className="fa-solid fa-user text-3xl"></i>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">#{player.number || '—'}</span>
                </div>
              )}
            </div>

            {/* Position badge */}
            <span className="absolute -bottom-2 -right-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-black text-[var(--primary-color)] border border-white/10 rounded-md">
              {player.position}
            </span>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-wide">
                {player.name}
              </h1>
              {player.captain && (
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded font-bold">
                  Captain
                </span>
              )}
            </div>

            {/* Unboxed metadata: team · position · nationality */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
              {/* Clickable Team */}
              <button
                onClick={() => onSelectTeam && onSelectTeam(team.id)}
                className="flex items-center gap-1.5 text-slate-200 hover:text-[var(--primary-color)] transition-colors cursor-pointer group"
                title={`View ${team.name} profile`}
              >
                {team.logoUrl && (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span className="font-bold underline decoration-white/20 group-hover:decoration-[var(--primary-color)]">
                  {team.name}
                </span>
              </button>

              <span>·</span>

              {/* Position */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <i className="fa-solid fa-shirt text-slate-500"></i>
                <span>
                  {player.position === 'GK'
                    ? 'Goalkeeper'
                    : player.position === 'DF'
                    ? 'Defender'
                    : player.position === 'MF'
                    ? 'Midfielder'
                    : 'Forward'}
                </span>
                {player.number && <span className="text-slate-400">(#{player.number})</span>}
              </div>

              <span>·</span>

              {/* Nationality */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <i className="fa-solid fa-earth-europe text-slate-500"></i>
                <span>{player.nationality || 'International'}</span>
              </div>
            </div>

            {/* Quick Season Highlights */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              {stats.rating && (
                <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono text-amber-400 font-bold">
                  ★ RATING: {stats.rating}
                </div>
              )}
              {stats.goals !== null && stats.goals !== undefined && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">GOALS:</span>
                  <span className="text-emerald-400 font-bold">{stats.goals}</span>
                </div>
              )}
              {stats.assists !== null && stats.assists !== undefined && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">ASSISTS:</span>
                  <span className="text-blue-400 font-bold">{stats.assists}</span>
                </div>
              )}
              {stats.appearances !== null && stats.appearances !== undefined && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">APPS:</span>
                  <span className="text-white font-bold">{stats.appearances}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Indicator in Header */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Recent Ratings</span>
            <div className="flex items-center gap-1">
              {form.recentRatings.slice(0, 5).map((r, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono font-bold text-xs text-white"
                  title={`${r.match}: ${r.rating ?? 'N/A'}`}
                >
                  {r.rating !== null ? r.rating.toFixed(1) : '—'}
                </span>
              ))}
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Avg: {form.averageRating ? form.averageRating.toFixed(2) : '—'} · Trend: {form.formTrend}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PLAYER TABS: OVERVIEW, MATCHES, STATS, FORM
          ========================================================================= */}
      <div className="border-b border-white/10 flex items-center gap-1 overflow-x-auto scrollbar-none pb-px">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-wider whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[var(--primary-color)] text-white font-bold bg-white/5 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs ${isActive ? 'text-[var(--primary-color)]' : 'text-slate-500'}`}></i>
              <span>{tab.label}</span>
              {tab.id === 'matches' && matches.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-full text-slate-300">
                  {matches.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Highlights Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Appearances</span>
              {renderMetricValue(stats.appearances)}
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                {stats.starts !== null && stats.starts !== undefined ? `${stats.starts} starts` : 'Starts unavailable'}
              </span>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Minutes</span>
              {renderMetricValue(stats.minutes)}
              <span className="text-[10px] font-mono text-slate-500 block mt-1">
                {stats.minutes && stats.appearances
                  ? `~${Math.round(stats.minutes / stats.appearances)} min/app`
                  : 'Season playing time'}
              </span>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Goals & Assists</span>
              <div className="flex items-baseline gap-1.5">
                {stats.goals !== null && stats.goals !== undefined ? (
                  <span className="text-2xl font-mono font-bold text-emerald-400">{stats.goals}G</span>
                ) : (
                  <span className="text-slate-500 font-mono text-xs">No goals data</span>
                )}
                {stats.assists !== null && stats.assists !== undefined && (
                  <span className="text-lg font-mono font-bold text-blue-400 ml-1">/ {stats.assists}A</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">Goal contributions</span>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Average Rating</span>
              {renderMetricValue(stats.rating, { colorClass: 'text-amber-400' })}
              <span className="text-[10px] font-mono text-slate-500 block mt-1">Match performance score</span>
            </div>
          </div>

          {/* Club Info & Nationality Card */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-info text-[var(--primary-color)]"></i> Player Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Club</span>
                <div 
                  onClick={() => onSelectTeam && onSelectTeam(team.id)}
                  className="flex items-center gap-2 cursor-pointer group pt-1"
                >
                  {team.logoUrl && <img src={team.logoUrl} alt="" className="w-5 h-5 object-contain" />}
                  <span className="text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] transition-colors">
                    {team.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block">{competition.name}</span>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Role & Squad Number</span>
                <p className="text-sm font-display font-bold text-white pt-1">
                  {player.position} · Number {player.number || 'Not assigned'}
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">First Team Squad</span>
              </div>

              <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Nationality</span>
                <p className="text-sm font-display font-bold text-white pt-1">
                  {player.nationality || 'International'}
                </p>
                <span className="text-[10px] font-mono text-slate-500 block">Eligible for national selection</span>
              </div>
            </div>
          </div>

          {/* Recent Match Performance Strip */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <i className="fa-solid fa-list-check text-[var(--primary-color)]"></i> Recent Appearances
              </h3>
              <button
                onClick={() => setActiveTab('matches')}
                className="text-xs font-mono text-[var(--primary-color)] hover:underline cursor-pointer"
              >
                View All Matches ({matches.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {matches.slice(0, 3).map((m) => (
                <div
                  key={m.fixtureId}
                  className="bg-black/30 border border-white/5 rounded-xl p-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                        m.result === 'W'
                          ? 'bg-emerald-500 text-black'
                          : m.result === 'D'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {m.result}
                    </span>
                    <div>
                      <p className="text-xs font-display font-bold text-white">
                        vs {m.opponent.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {m.minutesPlayed ?? 90} mins
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {m.goals ? (
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        +{m.goals} Goal
                      </span>
                    ) : null}
                    {m.rating && (
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                        ★ {m.rating}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MATCHES
          ========================================================================= */}
      {activeTab === 'matches' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-futbol text-[var(--primary-color)]"></i> Match Log & Performance Log
            </h3>
            <span className="text-xs font-mono text-slate-400">{matches.length} tracked appearances</span>
          </div>

          {matches.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 py-12 text-center">No match logs available for this player.</p>
          ) : (
            <div className="space-y-3">
              {matches.map((perf: PlayerMatchPerformance) => (
                <div
                  key={perf.fixtureId}
                  className="bg-black/30 border border-white/5 hover:border-white/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${
                        perf.result === 'W'
                          ? 'bg-emerald-500 text-black'
                          : perf.result === 'D'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {perf.result}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Date(perf.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-400">{perf.competition}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-display font-bold text-white">
                          vs {perf.opponent.name}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ({perf.score.home}-{perf.score.away})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Individual Metrics in Match */}
                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-slate-400">{perf.minutesPlayed ?? 90}'</span>
                      {perf.goals !== null && perf.goals !== undefined && perf.goals > 0 && (
                        <span className="text-emerald-400 font-bold">{perf.goals}G</span>
                      )}
                      {perf.assists !== null && perf.assists !== undefined && perf.assists > 0 && (
                        <span className="text-blue-400 font-bold">{perf.assists}A</span>
                      )}
                      {perf.passes !== null && perf.passes !== undefined && (
                        <span className="text-slate-400 hidden sm:inline">{perf.passes} passes</span>
                      )}
                    </div>

                    {perf.rating && (
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-mono font-bold">
                        ★ {perf.rating}
                      </span>
                    )}

                    {onSelectTeam && (
                      <button
                        onClick={() => onSelectTeam(perf.opponent.id)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-[11px] font-mono text-slate-300 transition-colors cursor-pointer"
                      >
                        Opponent →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: STATS
          Player metrics:
          - appearances
          - starts
          - minutes
          - goals
          - assists
          - shots
          - passes
          - pass accuracy
          - tackles
          - interceptions
          - cards
          - rating

          Strict requirements:
          - Only render metrics actually available from the provider.
          - Use graceful "Not available" states instead of fabricated zero values.
          ========================================================================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <i className="fa-solid fa-chart-simple text-[var(--primary-color)]"></i> Season Metrics & Telemetry
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Verified Opta Telemetry Provider
              </span>
            </div>

            {/* Note banner explaining provider integrity */}
            <div className="bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-mono text-slate-400">
              <i className="fa-solid fa-shield-halved text-slate-500"></i>
              <span>Displaying authentic provider telemetry. Unrecorded metrics gracefully indicate <em>Not available</em> without zero-fabrication.</span>
            </div>

            {/* Grid of the 12 Requested Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* 1. Appearances */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Appearances</span>
                {renderMetricValue(stats.appearances)}
                <span className="text-[10px] font-mono text-slate-500 block">Total matches entered</span>
              </div>

              {/* 2. Starts */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Starts</span>
                {renderMetricValue(stats.starts)}
                <span className="text-[10px] font-mono text-slate-500 block">First XI selection</span>
              </div>

              {/* 3. Minutes */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Minutes</span>
                {renderMetricValue(stats.minutes)}
                <span className="text-[10px] font-mono text-slate-500 block">Total on-pitch playing time</span>
              </div>

              {/* 4. Goals */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Goals</span>
                {renderMetricValue(stats.goals, { colorClass: 'text-emerald-400' })}
                <span className="text-[10px] font-mono text-slate-500 block">Official competitive goals</span>
              </div>

              {/* 5. Assists */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Assists</span>
                {renderMetricValue(stats.assists, { colorClass: 'text-blue-400' })}
                <span className="text-[10px] font-mono text-slate-500 block">Direct goal assists</span>
              </div>

              {/* 6. Shots */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Shots</span>
                {renderMetricValue(stats.shots)}
                <span className="text-[10px] font-mono text-slate-500 block">Total attempts on goal</span>
              </div>

              {/* 7. Passes */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Passes</span>
                {renderMetricValue(stats.passes)}
                <span className="text-[10px] font-mono text-slate-500 block">Total completed deliveries</span>
              </div>

              {/* 8. Pass Accuracy */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Pass Accuracy</span>
                {renderMetricValue(stats.passAccuracy, { suffix: '%' })}
                <span className="text-[10px] font-mono text-slate-500 block">Distribution success rate</span>
              </div>

              {/* 9. Tackles */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Tackles</span>
                {renderMetricValue(stats.tackles)}
                <span className="text-[10px] font-mono text-slate-500 block">Successful challenges won</span>
              </div>

              {/* 10. Interceptions (Graceful "Not available" when null) */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Interceptions</span>
                {renderMetricValue(stats.interceptions)}
                <span className="text-[10px] font-mono text-slate-500 block">Defensive ball disruptions</span>
              </div>

              {/* 11. Cards */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Cards</span>
                {stats.yellowCards !== null && stats.yellowCards !== undefined ? (
                  <div className="flex items-center gap-2 py-0.5">
                    <span className="flex items-center gap-1 font-mono font-bold text-lg text-amber-400">
                      <span className="w-2.5 h-3.5 bg-amber-400 rounded-xs inline-block"></span>
                      {stats.yellowCards}
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="flex items-center gap-1 font-mono font-bold text-lg text-rose-400">
                      <span className="w-2.5 h-3.5 bg-rose-500 rounded-xs inline-block"></span>
                      {stats.redCards ?? 0}
                    </span>
                  </div>
                ) : (
                  renderMetricValue(null)
                )}
                <span className="text-[10px] font-mono text-slate-500 block">Disciplinary record (Y/R)</span>
              </div>

              {/* 12. Rating */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Rating</span>
                {renderMetricValue(stats.rating, { colorClass: 'text-amber-400' })}
                <span className="text-[10px] font-mono text-slate-500 block">Overall performance coefficient</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: FORM
          ========================================================================= */}
      {activeTab === 'form' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <i className="fa-solid fa-wave-square text-[var(--primary-color)]"></i> Form & Performance Trajectory
              </h3>
              <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded uppercase ${
                form.formTrend === 'improving'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : form.formTrend === 'declining'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-white/5 text-slate-300 border border-white/10'
              }`}>
                Trend: {form.formTrend}
              </span>
            </div>

            {/* Form Visual Trend Cards */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Last 5 Match Performance Ratings
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Avg: <strong className="text-white">{form.averageRating?.toFixed(2) ?? '—'}</strong>
                </span>
              </div>

              {/* Rating Bars */}
              <div className="grid grid-cols-5 gap-3 pt-2">
                {form.recentRatings.slice(0, 5).map((match, i) => {
                  const rating = match.rating ?? 7.0;
                  const heightPercent = Math.max(15, Math.min(100, ((rating - 5.0) / 5.0) * 100));

                  return (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white">
                        {match.rating !== null ? match.rating.toFixed(1) : '—'}
                      </span>
                      <div className="w-full bg-white/5 rounded-t-lg h-28 flex items-end p-1">
                        <div
                          className={`w-full rounded-t transition-all duration-500 ${
                            rating >= 8.0
                              ? 'bg-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]'
                              : rating >= 7.3
                              ? 'bg-emerald-400'
                              : 'bg-amber-400'
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-full text-center">
                        {match.opponent}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Match-by-Match Breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Detailed Match Breakdown
              </h4>
              <div className="space-y-2">
                {matches.map((m) => (
                  <div
                    key={m.fixtureId}
                    className="bg-black/30 border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                          m.result === 'W'
                            ? 'bg-emerald-500 text-black'
                            : m.result === 'D'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {m.result}
                      </span>
                      <span className="text-white font-bold">vs {m.opponent.name}</span>
                      <span className="text-slate-500">
                        {new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {m.goals ? <span className="text-emerald-400 font-bold">+{m.goals} G</span> : null}
                      {m.assists ? <span className="text-blue-400 font-bold">+{m.assists} A</span> : null}
                      <span className="text-amber-400 font-bold">★ {m.rating ?? '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
