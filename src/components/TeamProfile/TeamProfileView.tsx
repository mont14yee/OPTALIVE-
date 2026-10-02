import React, { useState, useEffect, useCallback } from 'react';
import { 
  TeamProfile, 
  Fixture, 
  NewsArticle, 
  PlayerProfileItem,
  StandingEntry 
} from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { ArticleModal } from '../NewsView/ArticleModal';

export type TeamTab = 'overview' | 'fixtures' | 'results' | 'table' | 'squad' | 'stats' | 'news';

interface TeamProfileViewProps {
  teamId: string;
  onBack?: () => void;
  onSelectPlayer?: (playerId: string) => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectFixture?: (fixture: Fixture) => void;
}

export const TeamProfileView: React.FC<TeamProfileViewProps> = ({
  teamId,
  onBack,
  onSelectPlayer,
  onSelectTeam,
  onSelectFixture
}) => {
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');
  const [profile, setProfile] = useState<TeamProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [allTeams, setAllTeams] = useState<{ id: string; name: string; shortName: string; logoUrl: string }[]>([]);

  // Load team profile data
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await footballClient.getTeamProfile(teamId);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load team profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to retrieve team profile');
    } finally {
      setIsLoading(false);
    }
  }, [teamId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Load team list for quick switcher
  useEffect(() => {
    footballClient.getAllTeams().then((teams) => {
      setAllTeams(teams);
    }).catch(() => {});
  }, []);

  const tabs: { id: TeamTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: 'fa-shield-halved' },
    { id: 'fixtures', label: 'FIXTURES', icon: 'fa-calendar' },
    { id: 'results', label: 'RESULTS', icon: 'fa-square-check' },
    { id: 'table', label: 'TABLE', icon: 'fa-table-list' },
    { id: 'squad', label: 'SQUAD', icon: 'fa-users' },
    { id: 'stats', label: 'STATS', icon: 'fa-chart-pie' },
    { id: 'news', label: 'NEWS', icon: 'fa-newspaper' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10"></div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <div className="h-8 w-64 bg-white/10 rounded-lg mx-auto md:mx-0"></div>
              <div className="h-4 w-40 bg-white/5 rounded mx-auto md:mx-0"></div>
              <div className="h-4 w-52 bg-white/5 rounded mx-auto md:mx-0"></div>
            </div>
          </div>
        </div>
        {/* Tabs Bar Skeleton */}
        <div className="h-12 bg-slate-900/40 border border-white/5 rounded-xl"></div>
        {/* Content Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-900/40 border border-white/5 rounded-xl"></div>
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
        <h3 className="text-lg font-bold text-white uppercase tracking-wider">Team Profile Unavailable</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">{error || 'Could not load data for this club.'}</p>
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

  const { team, competition, stats, standings, fixtures, results, squad, news } = profile;

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
            Clubs / {competition.shortName} / {team.shortName}
          </span>
        </div>

        {/* Quick Club Switcher Dropdown */}
        {allTeams.length > 0 && onSelectTeam && (
          <div className="relative">
            <select
              value={team.id}
              onChange={(e) => onSelectTeam(e.target.value)}
              className="appearance-none bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-200 py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none focus:border-[var(--primary-color)]"
            >
              <option disabled>Switch Club...</option>
              {allTeams.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.name}
                </option>
              ))}
            </select>
            <i className="fa-solid fa-chevron-down text-[10px] text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"></i>
          </div>
        )}
      </div>

      {/* =========================================================================
          TEAM HEADER (Exact requirements: crest, team name, country, competition)
          ========================================================================= */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-color)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Team Crest */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-black/40 border border-white/10 p-3.5 flex items-center justify-center shadow-2xl">
              {team.logoUrl ? (
                <img
                  src={team.logoUrl}
                  alt={team.name}
                  className="w-full h-full object-contain filter drop-shadow-md"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <i className="fa-solid fa-shield-halved text-4xl text-slate-500"></i>
              )}
            </div>
            {team.code && (
              <span className="absolute -bottom-2 -right-1 font-mono text-[10px] font-bold px-2 py-0.5 bg-black/80 text-[var(--primary-color)] border border-white/10 rounded-md">
                {team.code}
              </span>
            )}
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-black text-white tracking-wide">
                {team.name}
              </h1>
            </div>

            {/* Unboxed metadata: country · competition · founded · manager */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs text-slate-400 font-mono">
              {/* Competition with crest */}
              <div className="flex items-center gap-1.5 text-slate-300">
                {competition.logoUrl && (
                  <img
                    src={competition.logoUrl}
                    alt={competition.name}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{competition.name}</span>
              </div>

              <span>·</span>

              {/* Country */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <i className="fa-solid fa-earth-americas text-slate-500"></i>
                <span>{team.country || 'Global'}</span>
              </div>

              {team.stadium && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <i className="fa-solid fa-landmark text-slate-500"></i>
                    <span>{team.stadium}</span>
                  </div>
                </>
              )}

              {team.manager && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <i className="fa-solid fa-user-tie text-slate-500"></i>
                    <span>Mgr: {team.manager}</span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Record Badge Bar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                <span className="text-slate-400 mr-1.5">RECORD:</span>
                <span className="text-white font-bold">{stats.wins}W</span>
                <span className="text-slate-500 mx-1">-</span>
                <span className="text-slate-300 font-bold">{stats.draws}D</span>
                <span className="text-slate-500 mx-1">-</span>
                <span className="text-slate-400 font-bold">{stats.losses}L</span>
              </div>

              {stats.position && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">TABLE RANK:</span>
                  <span className="text-[var(--primary-color)] font-bold">#{stats.position}</span>
                </div>
              )}

              {stats.points !== undefined && (
                <div className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-mono">
                  <span className="text-slate-400 mr-1.5">PTS:</span>
                  <span className="text-white font-bold">{stats.points}</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Strip in Header */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Recent Form</span>
            <div className="flex items-center gap-1">
              {stats.form.slice(-5).map((outcome, idx) => (
                <span
                  key={idx}
                  className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs ${
                    outcome === 'W'
                      ? 'bg-emerald-500 text-black'
                      : outcome === 'D'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                  title={outcome === 'W' ? 'Win' : outcome === 'D' ? 'Draw' : 'Loss'}
                >
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          TEAM TABS BAR (OVERVIEW, FIXTURES, RESULTS, TABLE, SQUAD, STATS, NEWS)
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
              {tab.id === 'fixtures' && fixtures.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-full text-slate-300">
                  {fixtures.length}
                </span>
              )}
              {tab.id === 'squad' && squad.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-white/10 rounded-full text-slate-300">
                  {squad.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB CONTENT
          ========================================================================= */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Matches</span>
              <span className="text-2xl font-mono font-bold text-white">{stats.matches}</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">Played this season</span>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Win Rate</span>
              <span className="text-2xl font-mono font-bold text-emerald-400">{stats.winRate}%</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">{stats.wins} wins recorded</span>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Goals For</span>
              <span className="text-2xl font-mono font-bold text-white">{stats.goalsFor}</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">{(stats.goalsFor / Math.max(1, stats.matches)).toFixed(2)} per match</span>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Goals Against</span>
              <span className="text-2xl font-mono font-bold text-white">{stats.goalsAgainst}</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">GD: {stats.goalDifference > 0 ? `+${stats.goalDifference}` : stats.goalDifference}</span>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Clean Sheets</span>
              <span className="text-2xl font-mono font-bold text-blue-400">{stats.cleanSheets}</span>
              <span className="text-[10px] font-mono text-slate-500 block mt-1">Shutouts recorded</span>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Avg Possession</span>
              {stats.possession !== null && stats.possession !== undefined ? (
                <>
                  <span className="text-2xl font-mono font-bold text-[var(--primary-color)]">{stats.possession}%</span>
                  <span className="text-[10px] font-mono text-slate-500 block mt-1">Match control</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-mono text-slate-500 block my-1">Not available</span>
                  <span className="text-[10px] font-mono text-slate-600 block">Not tracked by tier</span>
                </>
              )}
            </div>
          </div>

          {/* Next Match & Recent Result Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Next Fixture */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-[var(--primary-color)] font-bold">
                  <i className="fa-solid fa-calendar-day"></i> Next Fixture
                </span>
                <span>{fixtures[0]?.round || 'Upcoming'}</span>
              </div>

              {fixtures.length > 0 ? (
                <div 
                  onClick={() => onSelectFixture && onSelectFixture(fixtures[0])}
                  className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {fixtures[0].homeTeam?.logoUrl && (
                        <img src={fixtures[0].homeTeam.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                      )}
                      <span className="text-sm font-display font-bold text-white truncate">{fixtures[0].homeTeam?.name}</span>
                    </div>

                    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-slate-300">
                      VS
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-display font-bold text-white truncate text-right">{fixtures[0].awayTeam?.name}</span>
                      {fixtures[0].awayTeam?.logoUrl && (
                        <img src={fixtures[0].awayTeam.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                    <span><i className="fa-solid fa-location-dot text-slate-500 mr-1.5"></i>{fixtures[0].venue || 'Stadium'}</span>
                    <span>{new Date(fixtures[0].startingAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-slate-500 py-6 text-center">No upcoming fixtures scheduled</p>
              )}
            </div>

            {/* Last Result */}
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="uppercase tracking-wider flex items-center gap-1.5 text-emerald-400 font-bold">
                  <i className="fa-solid fa-circle-check"></i> Latest Result
                </span>
                <span>{results[0]?.round || 'Completed'}</span>
              </div>

              {results.length > 0 ? (
                <div 
                  onClick={() => onSelectFixture && onSelectFixture(results[0])}
                  className="bg-black/30 border border-white/5 rounded-xl p-4 hover:border-white/20 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between">
                    {/* Home Team */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {results[0].homeTeam?.logoUrl && (
                        <img src={results[0].homeTeam.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                      )}
                      <span className="text-sm font-display font-bold text-white truncate">{results[0].homeTeam?.name}</span>
                    </div>

                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded text-sm font-mono font-bold">
                      {results[0].score?.home ?? 0} - {results[0].score?.away ?? 0}
                    </div>

                    {/* Away Team */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 justify-end">
                      <span className="text-sm font-display font-bold text-white truncate text-right">{results[0].awayTeam?.name}</span>
                      {results[0].awayTeam?.logoUrl && (
                        <img src={results[0].awayTeam.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-white/5">
                    <span><i className="fa-solid fa-whistle text-slate-500 mr-1.5"></i>Full Time</span>
                    <span>{new Date(results[0].startingAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-mono text-slate-500 py-6 text-center">No completed results recorded</p>
              )}
            </div>
          </div>

          {/* Featured Squad Roster Snippet */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <i className="fa-solid fa-users text-[var(--primary-color)]"></i> Key Squad Members
              </h3>
              <button
                onClick={() => setActiveTab('squad')}
                className="text-xs font-mono text-[var(--primary-color)] hover:underline cursor-pointer"
              >
                View Full Squad ({squad.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {squad.slice(0, 8).map((player) => (
                <div
                  key={player.id}
                  onClick={() => onSelectPlayer && onSelectPlayer(player.id)}
                  className="bg-black/30 border border-white/5 hover:border-[var(--primary-color)]/50 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center flex-shrink-0">
                      {player.number || '—'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-display font-bold text-white group-hover:text-[var(--primary-color)] truncate transition-colors">
                        {player.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {player.position} {player.nationality ? `· ${player.nationality}` : ''}
                      </p>
                    </div>
                  </div>

                  {player.rating && (
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      ★ {player.rating}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. FIXTURES TAB */}
      {activeTab === 'fixtures' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-calendar text-[var(--primary-color)]"></i> Scheduled Fixtures
            </h3>
            <span className="text-xs font-mono text-slate-400">{fixtures.length} upcoming matches</span>
          </div>

          {fixtures.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No scheduled fixtures found for this club.
            </div>
          ) : (
            <div className="space-y-3">
              {fixtures.map((fixture) => {
                const isHome = fixture.homeTeam?.id?.toLowerCase() === team.id.toLowerCase();
                const opponent = isHome ? fixture.awayTeam : fixture.homeTeam;

                return (
                  <div
                    key={fixture.id}
                    className="bg-black/30 border border-white/5 hover:border-white/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                        {isHome ? 'HOME' : 'AWAY'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">{fixture.round || 'Match'}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-mono text-slate-400">{fixture.competition?.name}</span>
                        </div>
                        <p className="text-sm font-display font-bold text-white mt-0.5">
                          vs {opponent?.name || 'Opponent'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                      <div className="text-left md:text-right text-xs font-mono text-slate-400">
                        <p className="text-white font-bold">
                          {new Date(fixture.startingAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-slate-500">
                          {new Date(fixture.startingAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>

                      {onSelectFixture && (
                        <button
                          onClick={() => onSelectFixture(fixture)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                        >
                          Match Center →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-square-check text-emerald-400"></i> Match Results
            </h3>
            <span className="text-xs font-mono text-slate-400">{results.length} completed matches</span>
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No recent match results available for this club.
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((result) => {
                const isHome = result.homeTeam?.id?.toLowerCase() === team.id.toLowerCase();
                const homeScore = result.score?.home ?? 0;
                const awayScore = result.score?.away ?? 0;
                const teamScore = isHome ? homeScore : awayScore;
                const oppScore = isHome ? awayScore : homeScore;
                const outcome = teamScore > oppScore ? 'W' : teamScore === oppScore ? 'D' : 'L';
                const opponent = isHome ? result.awayTeam : result.homeTeam;

                return (
                  <div
                    key={result.id}
                    className="bg-black/30 border border-white/5 hover:border-white/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded flex items-center justify-center font-mono font-bold text-xs ${
                          outcome === 'W'
                            ? 'bg-emerald-500 text-black'
                            : outcome === 'D'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {outcome}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-400">{result.round || 'Match'}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-xs font-mono text-slate-400">
                            {new Date(result.startingAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-display font-bold text-white mt-0.5">
                          {isHome ? `${team.shortName} vs ${opponent?.shortName}` : `${opponent?.shortName} vs ${team.shortName}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-2 md:pt-0">
                      <span className="text-base font-mono font-bold text-white px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
                        {homeScore} - {awayScore}
                      </span>

                      {onSelectFixture && (
                        <button
                          onClick={() => onSelectFixture(result)}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                        >
                          Telemetry & Stats →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 4. TABLE TAB */}
      {activeTab === 'table' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-table-list text-[var(--primary-color)]"></i> {competition.name} Standings
            </h3>
            <span className="text-xs font-mono text-slate-400">Season {standings?.season || '2024/25'}</span>
          </div>

          {standings?.table && standings.table.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Club</th>
                    <th className="py-2.5 px-2 text-center">PL</th>
                    <th className="py-2.5 px-2 text-center">W</th>
                    <th className="py-2.5 px-2 text-center">D</th>
                    <th className="py-2.5 px-2 text-center">L</th>
                    <th className="py-2.5 px-2 text-center hidden sm:table-cell">GF</th>
                    <th className="py-2.5 px-2 text-center hidden sm:table-cell">GA</th>
                    <th className="py-2.5 px-2 text-center">GD</th>
                    <th className="py-2.5 px-3 text-center font-bold text-white">PTS</th>
                    <th className="py-2.5 px-3 text-center hidden md:table-cell">Form</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {standings.table.map((row: StandingEntry) => {
                    const isCurrent = row.team?.id?.toLowerCase() === team.id.toLowerCase();
                    return (
                      <tr
                        key={row.position}
                        onClick={() => onSelectTeam && onSelectTeam(row.team.id)}
                        className={`transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[var(--primary-color)]/10 text-white font-bold'
                            : 'hover:bg-white/5 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-400">
                          {row.position}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            {row.team?.logoUrl && (
                              <img src={row.team.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                            )}
                            <span className="truncate">{row.team?.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-[var(--primary-color)] text-black rounded font-mono font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{row.played}</td>
                        <td className="py-2.5 px-2 text-center">{row.won}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{row.drawn}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400">{row.lost}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400 hidden sm:table-cell">{row.goalsFor}</td>
                        <td className="py-2.5 px-2 text-center text-slate-400 hidden sm:table-cell">{row.goalsAgainst}</td>
                        <td className="py-2.5 px-2 text-center font-bold">
                          {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-white text-sm">{row.points}</td>
                        <td className="py-2.5 px-3 text-center hidden md:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            {row.form?.slice(-5).map((f, i) => (
                              <span
                                key={i}
                                className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                                  f === 'W'
                                    ? 'bg-emerald-500 text-black'
                                    : f === 'D'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs font-mono text-slate-500 py-6 text-center">League table data currently unavailable</p>
          )}
        </div>
      )}

      {/* 5. SQUAD TAB */}
      {activeTab === 'squad' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-users text-[var(--primary-color)]"></i> First Team Roster
            </h3>
            <span className="text-xs font-mono text-slate-400">{squad.length} registered players</span>
          </div>

          {/* Grouped by Position: GK, DF, MF, FW */}
          {(['GK', 'DF', 'MF', 'FW'] as const).map((pos) => {
            const playersInPos = squad.filter((p) => p.position === pos);
            if (playersInPos.length === 0) return null;

            const posName = pos === 'GK' ? 'Goalkeepers' : pos === 'DF' ? 'Defenders' : pos === 'MF' ? 'Midfielders' : 'Forwards';

            return (
              <div key={pos} className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-widest text-slate-400 border-b border-white/5 pb-1 flex items-center justify-between">
                  <span>{posName}</span>
                  <span>{playersInPos.length}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {playersInPos.map((player: PlayerProfileItem) => (
                    <div
                      key={player.id}
                      onClick={() => onSelectPlayer && onSelectPlayer(player.id)}
                      className="bg-black/30 border border-white/5 hover:border-[var(--primary-color)]/60 rounded-xl p-3 flex items-center justify-between cursor-pointer transition-all hover:bg-white/5 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Player Number */}
                        <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-mono font-bold text-slate-300 flex items-center justify-center flex-shrink-0 group-hover:border-[var(--primary-color)] transition-colors">
                          {player.number || '—'}
                        </span>

                        <div className="min-w-0">
                          <p className="text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] truncate transition-colors">
                            {player.name}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            {player.nationality || 'Player'}
                            {player.appearances !== undefined && ` · ${player.appearances} apps`}
                            {player.goals ? ` · ${player.goals}G` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {player.rating && (
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            ★ {player.rating}
                          </span>
                        )}
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-600 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. STATS TAB (matches, wins, draws, losses, goals, clean sheets, possession, passing, form) */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Core Season Record Cards */}
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2 pb-2 border-b border-white/10">
              <i className="fa-solid fa-chart-pie text-[var(--primary-color)]"></i> Season Telemetry & Metrics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Matches Played</span>
                <span className="text-2xl font-mono font-bold text-white">{stats.matches}</span>
                <div className="mt-2 text-xs font-mono text-slate-400 flex items-center gap-2">
                  <span className="text-emerald-400">{stats.wins}W</span>
                  <span>·</span>
                  <span className="text-amber-400">{stats.draws}D</span>
                  <span>·</span>
                  <span className="text-rose-400">{stats.losses}L</span>
                </div>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Goals Scored</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">{stats.goalsFor}</span>
                <span className="text-xs font-mono text-slate-500 block mt-2">
                  Avg {(stats.goalsFor / Math.max(1, stats.matches)).toFixed(2)} / match
                </span>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Goals Conceded</span>
                <span className="text-2xl font-mono font-bold text-rose-400">{stats.goalsAgainst}</span>
                <span className="text-xs font-mono text-slate-500 block mt-2">
                  Avg {(stats.goalsAgainst / Math.max(1, stats.matches)).toFixed(2)} / match
                </span>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Clean Sheets</span>
                <span className="text-2xl font-mono font-bold text-blue-400">{stats.cleanSheets}</span>
                <span className="text-xs font-mono text-slate-500 block mt-2">
                  {Math.round((stats.cleanSheets / Math.max(1, stats.matches)) * 100)}% of matches
                </span>
              </div>
            </div>

            {/* In-Depth Tactical Metrics (Possession & Passing where available) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Possession Metric Card */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Average Possession</span>
                  <i className="fa-solid fa-stopwatch text-slate-500"></i>
                </div>

                {stats.possession !== null && stats.possession !== undefined ? (
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-mono font-bold text-[var(--primary-color)]">{stats.possession}%</span>
                      <span className="text-xs font-mono text-slate-400">ball control</span>
                    </div>
                    {/* Visual Meter */}
                    <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden">
                      <div
                        className="bg-[var(--primary-color)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, stats.possession)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <span className="text-sm font-mono text-slate-500 block">Not available</span>
                    <span className="text-[11px] font-mono text-slate-600 block mt-1">Provider telemetry tier does not track possession for this competition</span>
                  </div>
                )}
              </div>

              {/* Passing Statistics Metric Card */}
              <div className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Passing Statistics</span>
                  <i className="fa-solid fa-arrows-split-up-and-left text-slate-500"></i>
                </div>

                {stats.passAccuracy !== null && stats.passAccuracy !== undefined ? (
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-mono font-bold text-white">{stats.passAccuracy}%</span>
                      {stats.passesTotal && (
                        <span className="text-xs font-mono text-slate-400">
                          {stats.passesTotal.toLocaleString()} total passes
                        </span>
                      )}
                    </div>
                    {/* Visual Accuracy Bar */}
                    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, stats.passAccuracy)}%` }}
                      ></div>
                    </div>
                  </div>
                ) : (
                  <div className="py-4 text-center">
                    <span className="text-sm font-mono text-slate-500 block">Not available</span>
                    <span className="text-[11px] font-mono text-slate-600 block mt-1">Passing statistics not recorded by telemetry provider</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Analysis */}
            <div className="bg-black/40 border border-white/5 rounded-xl p-5 space-y-3">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">Recent Form Trajectory</span>
              <div className="flex flex-wrap items-center gap-3">
                {stats.form.map((outcome, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <span
                      className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] ${
                        outcome === 'W'
                          ? 'bg-emerald-500 text-black'
                          : outcome === 'D'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {outcome}
                    </span>
                    <span className="text-xs font-mono text-slate-300">
                      Match {stats.matches - stats.form.length + idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. NEWS TAB */}
      {activeTab === 'news' && (
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
              <i className="fa-solid fa-newspaper text-[var(--primary-color)]"></i> {team.name} News Wire
            </h3>
            <span className="text-xs font-mono text-slate-400">{news.length} verified reports</span>
          </div>

          {news.length === 0 ? (
            <p className="text-xs font-mono text-slate-500 py-10 text-center">No news articles currently published for this club.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedArticle(item)}
                  className="bg-black/30 border border-white/5 hover:border-[var(--primary-color)]/50 rounded-xl overflow-hidden cursor-pointer transition-all hover:bg-white/5 group flex flex-col justify-between"
                >
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span className="text-[var(--primary-color)] font-bold uppercase">{item.category}</span>
                      <span>{item.source}</span>
                    </div>

                    <h4 className="text-sm font-display font-bold text-white group-hover:text-[var(--primary-color)] transition-colors line-clamp-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  <div className="px-4 py-2 bg-white/5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{new Date(item.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    <span className="group-hover:translate-x-1 transition-transform">Read Story →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dedicated Article Reader Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenMatch={onSelectFixture ? (fixtureId) => {
            setSelectedArticle(null);
            footballClient.getMatchDetails(fixtureId).then((f) => onSelectFixture(f)).catch(() => {});
          } : undefined}
        />
      )}
    </div>
  );
};
