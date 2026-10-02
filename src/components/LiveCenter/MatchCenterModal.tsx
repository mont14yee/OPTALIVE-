import React, { useState, useEffect } from 'react';
import {
  Fixture,
  MatchEvent,
  MatchStatistics,
  LeagueStandings,
  PlayerMatchStats,
  TacticalAnalysis
} from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { AiFootballIntelligenceView } from './AiFootballIntelligenceView';

interface MatchCenterModalProps {
  fixture: Fixture | null;
  onClose: () => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

type TabType = 'OVERVIEW' | 'AI_INTEL' | 'STATS' | 'EVENTS' | 'LINEUPS' | 'PLAYERS' | 'TABLE';

export const MatchCenterModal: React.FC<MatchCenterModalProps> = ({ 
  fixture, 
  onClose,
  onSelectTeam,
  onSelectPlayer
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('OVERVIEW');
  const [standings, setStandings] = useState<LeagueStandings | null>(null);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [tacticalAnalysis, setTacticalAnalysis] = useState<TacticalAnalysis | null>(null);
  const [loadingTactics, setLoadingTactics] = useState(false);
  const [playerTeamFilter, setPlayerTeamFilter] = useState<'all' | 'home' | 'away'>('all');
  const [playerSortBy, setPlayerSortBy] = useState<'rating' | 'goals' | 'passes' | 'tackles'>('rating');
  const [eventFilter, setEventFilter] = useState<'all' | 'goal' | 'card' | 'sub' | 'var'>('all');

  // Fetch League Standings when TABLE tab is opened or fixture changes
  useEffect(() => {
    if (!fixture) return;

    let isMounted = true;
    setLoadingStandings(true);

    footballClient
      .getStandings(fixture.competition.id)
      .then((data) => {
        if (isMounted) {
          setStandings(data);
          setLoadingStandings(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingStandings(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fixture?.competition?.id]);

  // Fetch AI Tactical Analysis for OVERVIEW tab
  useEffect(() => {
    if (!fixture) return;

    let isMounted = true;
    setLoadingTactics(true);

    footballClient
      .getTacticalAnalysis(fixture.id)
      .then((data) => {
        if (isMounted) {
          setTacticalAnalysis(data);
          setLoadingTactics(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLoadingTactics(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fixture?.id]);

  if (!fixture) return null;

  const {
    id,
    competition,
    round,
    homeTeam,
    awayTeam,
    score,
    status,
    minute,
    extraMinute,
    isLive,
    startingAt,
    venue,
    referee,
    events = [],
    statistics,
    lineups,
    playerStats = [],
    momentum
  } = fixture;

  const isMatchLive = isLive || status === 'LIVE' || status === 'HT' || status === 'AET' || status === 'PEN';

  // Format kickoff or finished time
  const formattedKickoff = new Date(startingAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const formattedDate = new Date(startingAt).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  // Filtered Events
  const filteredEvents = events.filter((ev) => {
    if (eventFilter === 'goal') return ev.type === 'goal' || ev.type === 'penalty_goal' || ev.type === 'own_goal';
    if (eventFilter === 'card') return ev.type === 'yellow_card' || ev.type === 'red_card';
    if (eventFilter === 'sub') return ev.type === 'substitution';
    if (eventFilter === 'var') return ev.type === 'var';
    return true;
  });

  // Filtered & Sorted Players
  const filteredPlayers = playerStats
    .filter((p) => {
      if (playerTeamFilter === 'home') return p.teamId === homeTeam.id;
      if (playerTeamFilter === 'away') return p.teamId === awayTeam.id;
      return true;
    })
    .sort((a, b) => {
      if (playerSortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (playerSortBy === 'goals') return b.goals - a.goals;
      if (playerSortBy === 'passes') return b.passes - a.passes;
      if (playerSortBy === 'tackles') return b.tackles - a.tackles;
      return 0;
    });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/15 rounded-3xl md:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {competition?.logoUrl && (
              <img
                src={competition.logoUrl}
                alt={competition.name || 'Competition'}
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <div className="flex items-center gap-2">
              <span className="font-display font-bold uppercase text-xs md:text-sm tracking-wider text-white">
                {competition?.name || 'Football Match'}
              </span>
              {round && <span className="text-[11px] font-mono text-slate-400">• {round}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close match details"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Match Score Hero Banner */}
        <div className="p-3.5 sm:p-6 md:p-8 bg-gradient-to-b from-slate-900/90 via-slate-950 to-slate-950 border-b border-white/10 flex-shrink-0">
          <div className="grid grid-cols-3 items-center text-center max-w-2xl mx-auto gap-1 sm:gap-3">
            {/* Home Team */}
            <div 
              onClick={() => {
                if (onSelectTeam && homeTeam?.id) {
                  onClose();
                  onSelectTeam(homeTeam.id);
                }
              }}
              className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group"
              title={`View ${homeTeam?.name || 'Home Club'} profile`}
            >
              <img
                src={homeTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
                alt={homeTeam?.name || 'Home Team'}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
                }}
              />
              <h4 className="font-display font-bold uppercase text-xs sm:text-sm md:text-lg text-white group-hover:text-[var(--primary-color)] transition-colors leading-tight line-clamp-2 max-w-[90px] sm:max-w-none">
                {homeTeam?.name || 'Home Club'}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                HOME
              </span>
            </div>

            {/* Score & Status Center */}
            <div className="flex flex-col items-center">
              {/* Match State Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/60 border border-white/10 mb-2">
                {isMatchLive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono font-bold text-red-400 uppercase tracking-wider">
                      {status === 'HT' ? 'HALF TIME' : `${minute}'${extraMinute ? `+${extraMinute}'` : ''} LIVE`}
                    </span>
                  </>
                ) : status === 'FT' ? (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    FULL TIME
                  </span>
                ) : status === 'PST' ? (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                    POSTPONED
                  </span>
                ) : status === 'CANC' ? (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-rose-400 uppercase tracking-wider">
                    CANCELLED
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider truncate max-w-[130px] sm:max-w-none">
                    {formattedKickoff}
                  </span>
                )}
              </div>

              {/* Main Score Display */}
              <div className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tighter flex items-center gap-2 sm:gap-3">
                <span>{status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score?.home ?? 0}</span>
                <span className="text-slate-600 text-2xl sm:text-3xl font-light">-</span>
                <span>{status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score?.away ?? 0}</span>
              </div>

              {/* xG where available */}
              {statistics?.xG && (
                <div className="mt-1 sm:mt-2 text-[10px] sm:text-[11px] font-mono font-bold text-slate-400 tracking-wider">
                  xG: <span className="text-white">{statistics.xG.home}</span> - <span className="text-white">{statistics.xG.away}</span>
                </div>
              )}
            </div>

            {/* Away Team */}
            <div 
              onClick={() => {
                if (onSelectTeam && awayTeam?.id) {
                  onClose();
                  onSelectTeam(awayTeam.id);
                }
              }}
              className="flex flex-col items-center gap-1.5 sm:gap-2 cursor-pointer group"
              title={`View ${awayTeam?.name || 'Away Club'} profile`}
            >
              <img
                src={awayTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
                alt={awayTeam?.name || 'Away Team'}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
                }}
              />
              <h4 className="font-display font-bold uppercase text-xs sm:text-sm md:text-lg text-white group-hover:text-[var(--primary-color)] transition-colors leading-tight line-clamp-2 max-w-[90px] sm:max-w-none">
                {awayTeam?.name || 'Away Club'}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                AWAY
              </span>
            </div>
          </div>
        </div>

        {/* Match Center Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center border-b border-white/10 bg-slate-900/60 overflow-x-auto no-scrollbar flex-shrink-0 px-4">
          {([
            { id: 'OVERVIEW', label: 'Overview', icon: 'fa-table-columns' },
            { id: 'AI_INTEL', label: 'AI Intelligence', icon: 'fa-brain', badge: 'NEW' },
            { id: 'STATS', label: 'Stats', icon: 'fa-chart-simple' },
            { id: 'EVENTS', label: 'Events', icon: 'fa-timeline' },
            { id: 'LINEUPS', label: 'Lineups', icon: 'fa-users' },
            { id: 'PLAYERS', label: 'Players', icon: 'fa-user-ninja' },
            { id: 'TABLE', label: 'Table', icon: 'fa-ranking-star' }
          ] as { id: TabType; label: string; icon: string; badge?: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 md:px-5 py-3 font-display font-bold uppercase text-xs md:text-sm tracking-wider transition-all whitespace-nowrap cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-[var(--primary-color)] text-[var(--primary-color)] bg-white/5'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              {/* Match Metadata Pill Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    <i className="fa-solid fa-trophy mr-1 text-[var(--primary-color)]" /> Competition
                  </span>
                  <p className="font-semibold text-white text-xs md:text-sm truncate">{competition.name}</p>
                  <p className="text-[10px] font-mono text-slate-500">{competition.country || 'Global'}</p>
                </div>

                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    <i className="fa-solid fa-location-dot mr-1 text-cyan-400" /> Venue
                  </span>
                  <p className="font-semibold text-white text-xs md:text-sm truncate">{venue || 'Official Stadium'}</p>
                  <p className="text-[10px] font-mono text-slate-500">{homeTeam.name} Home Ground</p>
                </div>

                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    <i className="fa-solid fa-whistle mr-1 text-amber-400" /> Referee
                  </span>
                  <p className="font-semibold text-white text-xs md:text-sm truncate">
                    {referee || 'Not assigned / TBD'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">Official Match Referee</p>
                </div>

                <div className="bg-slate-900/70 p-3.5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                    <i className="fa-solid fa-stopwatch mr-1 text-red-400" /> Status & Time
                  </span>
                  <p className="font-semibold text-white text-xs md:text-sm">
                    {isMatchLive ? `${minute}' Live In-Play` : status === 'FT' ? 'Match Completed' : 'Scheduled'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">{formattedKickoff}</p>
                </div>
              </div>

              {/* AI Intelligence Spotlight Feature */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 via-purple-900/20 to-slate-900/70 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-lg flex-shrink-0">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        AI Football Intelligence Suite
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
                        OPTALIVE AI
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">
                      Grounded match insights, head-to-head form analysis, individual player telemetry & post-match audit.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('AI_INTEL')}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md shadow-violet-600/30 flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0"
                >
                  <span>Launch Intelligence</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
              </div>

              {/* Recent Events Timeline Summary */}
              <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-display font-bold uppercase text-xs tracking-wider text-slate-300">
                    Recent Key Incidents
                  </h5>
                  <button
                    onClick={() => setActiveTab('EVENTS')}
                    className="text-xs font-mono text-[var(--primary-color)] hover:underline cursor-pointer"
                  >
                    View all {events.length} events →
                  </button>
                </div>

                {events.length === 0 ? (
                  <p className="text-xs font-mono text-slate-500 py-3">No key incidents recorded yet in this fixture.</p>
                ) : (
                  <div className="space-y-2">
                    {events.slice(-4).reverse().map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-slate-300 w-8">
                            {ev.minute}'
                          </span>
                          <span className="text-sm">
                            {ev.type.includes('goal') ? '⚽' : ev.type === 'yellow_card' ? '🟨' : ev.type === 'red_card' ? '🟥' : ev.type === 'substitution' ? '⇄' : '📺'}
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-white mr-2">{ev.player.name}</span>
                            <span className="text-[11px] font-mono text-slate-400">{ev.detail || ev.type}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black/40 text-slate-400">
                          {ev.teamId === homeTeam.id ? homeTeam.shortName : awayTeam.shortName}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Opta Momentum Pressure Graph */}
              {momentum && momentum.length > 0 && (
                <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-display font-bold uppercase text-xs tracking-wider text-slate-300">
                      Opta Pressure & Momentum Index
                    </h5>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="flex items-center gap-1 text-[var(--primary-color)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></span> {homeTeam.shortName}
                      </span>
                      <span className="flex items-center gap-1 text-cyan-400">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span> {awayTeam.shortName}
                      </span>
                    </div>
                  </div>

                  <div className="h-24 flex items-end gap-1.5 pt-4 border-b border-white/10">
                    {momentum.map((m, idx) => {
                      const isHome = m.value >= 0;
                      const heightPercent = Math.min(Math.abs(m.value), 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-center group relative">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-sm transition-all ${
                              isHome ? 'bg-[var(--primary-color)]/70 hover:bg-[var(--primary-color)]' : 'bg-cyan-500/70 hover:bg-cyan-400'
                            }`}
                          />
                          <span className="absolute -bottom-5 text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100">
                            {m.minute}'
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* AI Tactical Engine Briefing */}
              {tacticalAnalysis && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-slate-900/60 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-brain text-purple-400 text-sm"></i>
                      <h5 className="font-display font-bold uppercase text-xs tracking-wider text-purple-200">
                        OptaVision AI Tactical Analysis
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest">
                      Gemini Telemetry Core
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{tacticalAnalysis.matchSummary}</p>
                  {tacticalAnalysis.keyPlayerToWatch && (
                    <div className="pt-2 border-t border-purple-500/20 text-xs">
                      <span className="text-purple-300 font-semibold font-mono">Key Player Impact: </span>
                      <span className="text-white">{tacticalAnalysis.keyPlayerToWatch.name} ({tacticalAnalysis.keyPlayerToWatch.team})</span> — <span className="text-slate-400">{tacticalAnalysis.keyPlayerToWatch.reason}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STATS */}
          {activeTab === 'STATS' && (
            <div className="space-y-4 animate-fade-in">
              {!statistics ? (
                <div className="py-16 text-center bg-slate-900/30 rounded-2xl border border-white/5 space-y-2">
                  <i className="fa-solid fa-chart-simple text-3xl text-slate-600 mb-2" />
                  <p className="font-display font-bold uppercase text-slate-300 text-sm">
                    Statistics Not Available
                  </p>
                  <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                    Live telemetry is not supplied by the provider for this fixture. OptaLive never fabricates unverified statistics.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Possession Dual Bar */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-[var(--primary-color)]">{statistics.possession.home}%</span>
                      <span className="text-slate-400 uppercase">Ball Possession</span>
                      <span className="text-cyan-400">{statistics.possession.away}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                      <div
                        style={{ width: `${statistics.possession.home}%` }}
                        className="bg-[var(--primary-color)] h-full"
                      />
                      <div
                        style={{ width: `${statistics.possession.away}%` }}
                        className="bg-cyan-400 h-full"
                      />
                    </div>
                  </div>

                  {/* Pass Accuracy Dual Bar */}
                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold">
                      <span className="text-[var(--primary-color)]">{statistics.passAccuracy.home}%</span>
                      <span className="text-slate-400 uppercase">Pass Accuracy</span>
                      <span className="text-cyan-400">{statistics.passAccuracy.away}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden flex">
                      <div
                        style={{ width: `${statistics.passAccuracy.home}%` }}
                        className="bg-[var(--primary-color)] h-full"
                      />
                      <div
                        style={{ width: `${statistics.passAccuracy.away}%` }}
                        className="bg-cyan-400 h-full"
                      />
                    </div>
                  </div>

                  {/* Metric Comparisons Grid */}
                  <div className="space-y-2.5">
                    {[
                      {
                        label: 'Total Shots',
                        home: statistics.shotsTotal.home,
                        away: statistics.shotsTotal.away
                      },
                      {
                        label: 'Shots on Target',
                        home: statistics.shotsOnTarget.home,
                        away: statistics.shotsOnTarget.away
                      },
                      ...(statistics.xG
                        ? [{ label: 'Expected Goals (xG)', home: statistics.xG.home, away: statistics.xG.away }]
                        : []),
                      {
                        label: 'Corners',
                        home: statistics.corners.home,
                        away: statistics.corners.away
                      },
                      {
                        label: 'Fouls Committed',
                        home: statistics.fouls.home,
                        away: statistics.fouls.away
                      },
                      {
                        label: 'Offsides',
                        home: statistics.offsides.home,
                        away: statistics.offsides.away
                      },
                      {
                        label: 'Yellow Cards',
                        home: statistics.yellowCards.home,
                        away: statistics.yellowCards.away
                      },
                      {
                        label: 'Red Cards',
                        home: statistics.redCards.home,
                        away: statistics.redCards.away
                      },
                      ...(statistics.bigChancesCreated
                        ? [
                            {
                              label: 'Big Chances Created',
                              home: statistics.bigChancesCreated.home,
                              away: statistics.bigChancesCreated.away
                            }
                          ]
                        : []),
                      ...(statistics.saves
                        ? [
                            {
                              label: 'Goalkeeper Saves',
                              home: statistics.saves.home,
                              away: statistics.saves.away
                            }
                          ]
                        : [])
                    ].map((stat, idx) => {
                      const total = Number(stat.home) + Number(stat.away);
                      const homePercent = total > 0 ? (Number(stat.home) / total) * 100 : 50;

                      return (
                        <div
                          key={idx}
                          className="bg-slate-900/40 p-3 rounded-xl border border-white/5 flex items-center justify-between"
                        >
                          <span className="font-mono font-bold text-xs text-white w-12 text-left">
                            {stat.home}
                          </span>
                          <div className="flex-1 px-4">
                            <div className="text-center text-[11px] font-mono text-slate-400 mb-1">
                              {stat.label}
                            </div>
                            <div className="h-1.5 rounded-full bg-white/5 overflow-hidden flex">
                              <div
                                style={{ width: `${homePercent}%` }}
                                className="bg-[var(--primary-color)] h-full"
                              />
                              <div
                                style={{ width: `${100 - homePercent}%` }}
                                className="bg-cyan-400 h-full"
                              />
                            </div>
                          </div>
                          <span className="font-mono font-bold text-xs text-white w-12 text-right">
                            {stat.away}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AI FOOTBALL INTELLIGENCE */}
          {activeTab === 'AI_INTEL' && (
            <AiFootballIntelligenceView fixture={fixture} />
          )}

          {/* TAB 3: EVENTS */}
          {activeTab === 'EVENTS' && (
            <div className="space-y-4 animate-fade-in">
              {/* Event Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  { id: 'all', label: 'All Incidents' },
                  { id: 'goal', label: '⚽ Goals' },
                  { id: 'card', label: '🟨 Cards' },
                  { id: 'sub', label: '⇄ Substitutions' },
                  { id: 'var', label: '📺 VAR Decisions' }
                ].map((chip) => (
                  <button
                    key={chip.id}
                    onClick={() => setEventFilter(chip.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      eventFilter === chip.id
                        ? 'bg-[var(--primary-color)] text-black'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {filteredEvents.length === 0 ? (
                <div className="py-16 text-center bg-slate-900/30 rounded-2xl border border-white/5">
                  <p className="font-mono text-xs text-slate-400">No events found matching current filter.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredEvents.map((ev) => {
                    const isHome = ev.teamId === homeTeam.id;
                    const team = isHome ? homeTeam : awayTeam;

                    return (
                      <div
                        key={ev.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          isHome
                            ? 'bg-slate-900/70 border-l-4 border-l-[var(--primary-color)] border-white/5'
                            : 'bg-slate-900/70 border-r-4 border-r-cyan-400 border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-slate-300 w-10 text-center py-1 bg-black/40 rounded-lg">
                            {ev.minute}'{ev.extraMinute ? `+${ev.extraMinute}` : ''}
                          </span>

                          <span className="text-base flex-shrink-0">
                            {ev.type === 'goal' && '⚽'}
                            {ev.type === 'penalty_goal' && '🥅'}
                            {ev.type === 'own_goal' && '🤦'}
                            {ev.type === 'yellow_card' && '🟨'}
                            {ev.type === 'red_card' && '🟥'}
                            {ev.type === 'substitution' && '⇄'}
                            {ev.type === 'var' && '📺'}
                            {ev.type === 'woodwork' && '🎯'}
                          </span>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs md:text-sm text-white">
                                {ev.player.name}
                              </span>
                              {ev.assistPlayer && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  (Assist: {ev.assistPlayer.name})
                                </span>
                              )}
                              {ev.subPlayerIn && (
                                <span className="text-[11px] font-mono text-emerald-400">
                                  ON: {ev.subPlayerIn.name}
                                </span>
                              )}
                            </div>
                            {ev.detail && (
                              <p className="text-[11px] font-mono text-slate-400 mt-0.5">{ev.detail}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-display font-bold uppercase text-slate-300 hidden sm:inline">
                            {team.name}
                          </span>
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            className="w-5 h-5 object-contain"
                            onError={(e) => {
                              e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LINEUPS */}
          {activeTab === 'LINEUPS' && (
            <div className="space-y-6 animate-fade-in">
              {!lineups ? (
                <div className="py-16 text-center bg-slate-900/30 rounded-2xl border border-white/5 space-y-2">
                  <i className="fa-solid fa-users text-3xl text-slate-600 mb-2" />
                  <p className="font-display font-bold uppercase text-slate-300 text-sm">
                    Lineups Not Yet Published
                  </p>
                  <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                    Starting formations are officially released approximately 60 minutes prior to kickoff.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Formations Banner */}
                  <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-2xl border border-white/5">
                    <div>
                      <span className="font-display font-bold text-sm text-[var(--primary-color)]">
                        {homeTeam.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        Formation: {lineups.home.formation}
                      </span>
                      {lineups.home.coach && (
                        <p className="text-[10px] font-mono text-slate-500">Coach: {lineups.home.coach.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-display font-bold text-sm text-cyan-400">
                        {awayTeam.name}
                      </span>
                      <span className="text-xs font-mono text-slate-400 ml-2">
                        Formation: {lineups.away.formation}
                      </span>
                      {lineups.away.coach && (
                        <p className="text-[10px] font-mono text-slate-500">Coach: {lineups.away.coach.name}</p>
                      )}
                    </div>
                  </div>

                  {/* Interactive Football Pitch Field */}
                  <div className="relative w-full aspect-[16/10] md:aspect-[2/1] bg-gradient-to-b from-emerald-950/80 via-emerald-900/60 to-emerald-950/80 rounded-2xl border border-emerald-500/20 p-4 overflow-hidden flex flex-col justify-between shadow-2xl">
                    {/* Pitch Field Markings */}
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      {/* Outer boundary */}
                      <div className="absolute inset-3 border-2 border-white rounded-lg" />
                      {/* Center line */}
                      <div className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 w-0.5 bg-white" />
                      {/* Center circle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white rounded-full" />
                    </div>

                    {/* Home Team Left Half & Away Team Right Half */}
                    <div className="relative z-10 w-full h-full grid grid-cols-2 gap-4">
                      {/* Home Team Squad */}
                      <div className="flex flex-wrap items-center justify-around p-2">
                        {lineups.home.startingXI.map((player) => (
                          <div 
                            key={player.id} 
                            onClick={() => onSelectPlayer && (onClose(), onSelectPlayer(player.id))}
                            className="flex flex-col items-center group relative m-1 cursor-pointer hover:scale-110 transition-transform"
                            title={`View ${player.name} profile`}
                          >
                            <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] text-black font-display font-bold text-xs flex items-center justify-center border border-white/50 shadow-md">
                              {player.number}
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-white drop-shadow truncate max-w-[70px] mt-0.5 group-hover:text-[var(--primary-color)] transition-colors">
                              {player.shortName || player.name.split(' ').pop()}
                            </span>
                            {player.rating && (
                              <span className="text-[9px] font-mono px-1 rounded bg-black/60 text-[var(--primary-color)]">
                                {player.rating}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Away Team Squad */}
                      <div className="flex flex-wrap items-center justify-around p-2">
                        {lineups.away.startingXI.map((player) => (
                          <div 
                            key={player.id} 
                            onClick={() => onSelectPlayer && (onClose(), onSelectPlayer(player.id))}
                            className="flex flex-col items-center group relative m-1 cursor-pointer hover:scale-110 transition-transform"
                            title={`View ${player.name} profile`}
                          >
                            <div className="w-8 h-8 rounded-full bg-cyan-400 text-black font-display font-bold text-xs flex items-center justify-center border border-white/50 shadow-md">
                              {player.number}
                            </div>
                            <span className="text-[10px] font-mono font-semibold text-white drop-shadow truncate max-w-[70px] mt-0.5 group-hover:text-cyan-300 transition-colors">
                              {player.shortName || player.name.split(' ').pop()}
                            </span>
                            {player.rating && (
                              <span className="text-[9px] font-mono px-1 rounded bg-black/60 text-cyan-300">
                                {player.rating}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Starting XI Lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Home Starting XI */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h6 className="font-display font-bold text-xs text-[var(--primary-color)] uppercase">
                        {homeTeam.name} Starting XI
                      </h6>
                      <div className="space-y-1.5">
                        {lineups.home.startingXI.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-right font-mono font-bold text-slate-400">
                                {p.number}
                              </span>
                              <span className="text-white font-medium">{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                ({p.position})
                              </span>
                              {p.captain && (
                                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded">
                                  C
                                </span>
                              )}
                            </div>
                            {p.rating && (
                              <span className="font-mono text-xs font-bold text-[var(--primary-color)]">
                                {p.rating}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Away Starting XI */}
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h6 className="font-display font-bold text-xs text-cyan-400 uppercase">
                        {awayTeam.name} Starting XI
                      </h6>
                      <div className="space-y-1.5">
                        {lineups.away.startingXI.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-white/5"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 text-right font-mono font-bold text-slate-400">
                                {p.number}
                              </span>
                              <span className="text-white font-medium">{p.name}</span>
                              <span className="text-[10px] font-mono text-slate-500 uppercase">
                                ({p.position})
                              </span>
                              {p.captain && (
                                <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1 rounded">
                                  C
                                </span>
                              )}
                            </div>
                            {p.rating && (
                              <span className="font-mono text-xs font-bold text-cyan-400">
                                {p.rating}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Substitutes Bench */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h6 className="font-display font-semibold text-xs text-slate-400 uppercase">
                        {homeTeam.name} Substitutes
                      </h6>
                      <div className="space-y-1">
                        {lineups.home.substitutes.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs py-1 text-slate-400">
                            <span className="font-mono w-5 text-right">{p.number}</span>
                            <span className="flex-1 px-2 text-slate-300">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">({p.position})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900/30 p-4 rounded-2xl border border-white/5 space-y-2">
                      <h6 className="font-display font-semibold text-xs text-slate-400 uppercase">
                        {awayTeam.name} Substitutes
                      </h6>
                      <div className="space-y-1">
                        {lineups.away.substitutes.map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs py-1 text-slate-400">
                            <span className="font-mono w-5 text-right">{p.number}</span>
                            <span className="flex-1 px-2 text-slate-300">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">({p.position})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLAYERS */}
          {activeTab === 'PLAYERS' && (
            <div className="space-y-4 animate-fade-in">
              {/* Filter & Sorting Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'all', label: 'All Players' },
                    { id: 'home', label: homeTeam.shortName },
                    { id: 'away', label: awayTeam.shortName }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setPlayerTeamFilter(btn.id as any)}
                      className={`px-3 py-1 rounded-xl font-mono text-xs cursor-pointer transition-all ${
                        playerTeamFilter === btn.id
                          ? 'bg-[var(--primary-color)] text-black font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Sort:</span>
                  {(['rating', 'goals', 'passes', 'tackles'] as const).map((key) => (
                    <button
                      key={key}
                      onClick={() => setPlayerSortBy(key)}
                      className={`px-2 py-0.5 rounded capitalize cursor-pointer transition-colors ${
                        playerSortBy === key
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>

              {filteredPlayers.length === 0 ? (
                <div className="py-16 text-center bg-slate-900/30 rounded-2xl border border-white/5 space-y-2">
                  <i className="fa-solid fa-address-card text-3xl text-slate-600 mb-2" />
                  <p className="font-display font-bold uppercase text-slate-300 text-sm">
                    Individual Player Telemetry Pending
                  </p>
                  <p className="text-xs font-mono text-slate-500 max-w-md mx-auto">
                    Opta player tracking metrics (passes, pass accuracy, tackles, shots, ratings) are indexed as soon as verified by the official provider.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-4">Player</th>
                        <th className="py-3 px-2">Team</th>
                        <th className="py-3 px-2">Pos</th>
                        <th className="py-3 px-2 text-center">Rating</th>
                        <th className="py-3 px-2 text-center">Goals</th>
                        <th className="py-3 px-2 text-center">Assists</th>
                        <th className="py-3 px-2 text-center">Shots (OT)</th>
                        <th className="py-3 px-2 text-center">Passes</th>
                        <th className="py-3 px-2 text-center">Pass %</th>
                        <th className="py-3 px-2 text-center">Tackles</th>
                        <th className="py-3 px-2 text-center">Cards</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-950/60">
                      {filteredPlayers.map((p) => {
                        const isHome = p.teamId === homeTeam.id;
                        return (
                          <tr 
                            key={p.playerId} 
                            onClick={() => onSelectPlayer && (onClose(), onSelectPlayer(p.playerId))}
                            className="hover:bg-white/5 transition-colors cursor-pointer group"
                            title={`View ${p.name} profile`}
                          >
                            <td className="py-2.5 px-4 font-sans font-semibold text-white group-hover:text-[var(--primary-color)] transition-colors whitespace-nowrap">
                              <span className="font-mono text-slate-500 mr-2">#{p.number}</span>
                              {p.name}
                            </td>
                            <td className="py-2.5 px-2 text-slate-400">
                              {isHome ? homeTeam.shortName : awayTeam.shortName}
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 text-[10px]">
                                {p.position}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center font-bold">
                              {p.rating ? (
                                <span
                                  className={`px-1.5 py-0.5 rounded ${
                                    p.rating >= 8.0
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : p.rating >= 7.0
                                      ? 'bg-blue-500/20 text-blue-300'
                                      : 'bg-white/10 text-slate-300'
                                  }`}
                                >
                                  {p.rating.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center text-white font-bold">{p.goals}</td>
                            <td className="py-2.5 px-2 text-center text-slate-300">{p.assists}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">
                              {p.shots}{p.shotsOnTarget !== undefined ? ` (${p.shotsOnTarget})` : ''}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-300">{p.passes}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{p.passAccuracy}%</td>
                            <td className="py-2.5 px-2 text-center text-slate-300">{p.tackles}</td>
                            <td className="py-2.5 px-2 text-center">
                              {p.redCards > 0 ? (
                                <span className="text-rose-400 font-bold">🟥</span>
                              ) : p.yellowCards > 0 ? (
                                <span className="text-amber-400 font-bold">🟨</span>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TABLE (STANDINGS) */}
          {activeTab === 'TABLE' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-display font-bold uppercase text-xs tracking-wider text-slate-300">
                    {competition.name} Table
                  </h5>
                  <p className="text-[10px] font-mono text-slate-500">Official League Standings</p>
                </div>
                <span className="text-[10px] font-mono text-[var(--primary-color)]">
                  ● Highlighted Match Participants
                </span>
              </div>

              {loadingStandings ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--primary-color)] border-t-transparent animate-spin mx-auto" />
                  <p className="font-mono text-xs text-slate-400">Loading standings...</p>
                </div>
              ) : !standings || standings.table.length === 0 ? (
                <div className="py-16 text-center bg-slate-900/30 rounded-2xl border border-white/5 space-y-2">
                  <i className="fa-solid fa-table-list text-3xl text-slate-600 mb-2" />
                  <p className="font-display font-bold uppercase text-slate-300 text-sm">
                    Standings Not Available
                  </p>
                  <p className="text-xs font-mono text-slate-500">
                    Table standings for {competition.name} are currently being indexed.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-white/5">
                      <tr>
                        <th className="py-3 px-3 text-center w-8">#</th>
                        <th className="py-3 px-4">Club</th>
                        <th className="py-3 px-2 text-center">P</th>
                        <th className="py-3 px-2 text-center">W</th>
                        <th className="py-3 px-2 text-center">D</th>
                        <th className="py-3 px-2 text-center">L</th>
                        <th className="py-3 px-2 text-center">GF:GA</th>
                        <th className="py-3 px-2 text-center">GD</th>
                        <th className="py-3 px-3 text-center font-bold text-white">PTS</th>
                        <th className="py-3 px-3 text-center hidden md:table-cell">Form</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-950/60">
                      {standings.table.map((row) => {
                        const isMatchTeam = row.team.id === homeTeam.id || row.team.id === awayTeam.id;

                        return (
                          <tr
                            key={row.team.id}
                            className={`transition-colors ${
                              isMatchTeam
                                ? 'bg-[var(--primary-color)]/10 border-l-4 border-l-[var(--primary-color)]'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center font-bold text-slate-300">
                              {row.position}
                            </td>
                            <td className="py-2.5 px-4 font-sans font-bold text-white flex items-center gap-2.5 whitespace-nowrap">
                              <img
                                src={row.team.logoUrl}
                                alt={row.team.name}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
                                }}
                              />
                              <span className={isMatchTeam ? 'text-[var(--primary-color)]' : 'text-white'}>
                                {row.team.name}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{row.played}</td>
                            <td className="py-2.5 px-2 text-center text-slate-300">{row.won}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{row.drawn}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">{row.lost}</td>
                            <td className="py-2.5 px-2 text-center text-slate-400">
                              {row.goalsFor}:{row.goalsAgainst}
                            </td>
                            <td className="py-2.5 px-2 text-center text-slate-300">
                              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-white text-sm">
                              {row.points}
                            </td>
                            <td className="py-2.5 px-3 text-center hidden md:table-cell">
                              <div className="flex items-center justify-center gap-1">
                                {row.form.slice(-5).map((f, i) => (
                                  <span
                                    key={i}
                                    className={`w-4 h-4 rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                                      f === 'W'
                                        ? 'bg-emerald-500/20 text-emerald-300'
                                        : f === 'D'
                                        ? 'bg-amber-500/20 text-amber-300'
                                        : 'bg-rose-500/20 text-rose-300'
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
