import React, { useState } from 'react';
import { Fixture } from '../types/football';

interface LiveTrackerProps {
  fixtures: Fixture[];
  onSelectFixture: (fixture: Fixture) => void;
}

type StatusFilter = 'all' | 'live' | 'upcoming' | 'finished';

export const LiveTracker: React.FC<LiveTrackerProps> = ({ fixtures, onSelectFixture }) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const liveMatches = fixtures.filter(f => f.isLive || f.status === 'LIVE' || f.status === 'HT');
  const upcomingMatches = fixtures.filter(f => f.status === 'NS');
  const finishedMatches = fixtures.filter(f => f.status === 'FT');

  const filteredFixtures = fixtures.filter(f => {
    if (statusFilter === 'live') return f.isLive || f.status === 'LIVE' || f.status === 'HT';
    if (statusFilter === 'upcoming') return f.status === 'NS';
    if (statusFilter === 'finished') return f.status === 'FT';
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Tracker Status Subheader */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary-color)] shadow-[0_0_10px_var(--primary-color)]"></span>
          <h2 className="font-display font-bold uppercase text-sm md:text-base text-white tracking-wider">
            Match Telemetry Feed
          </h2>
          <span className="text-[11px] font-mono text-slate-400">({fixtures.length} matches)</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All', count: fixtures.length },
            { id: 'live', label: 'Live Now', count: liveMatches.length, isLivePill: true },
            { id: 'upcoming', label: 'Upcoming', count: upcomingMatches.length },
            { id: 'finished', label: 'Finished', count: finishedMatches.length },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id as StatusFilter)}
              className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-[11px] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {pill.isLivePill && pill.count > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              )}
              <span>{pill.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${statusFilter === pill.id ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'}`}>
                {pill.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      {filteredFixtures.length === 0 ? (
        <div className="py-16 text-center bg-slate-900/30 rounded-3xl border border-white/5 space-y-2">
          <i className="fa-solid fa-futbol text-3xl text-slate-600 mb-2"></i>
          <p className="font-display font-bold uppercase text-slate-300 text-sm">No matches found for current filter</p>
          <p className="text-xs font-mono text-slate-500">Switch status filters or choose another date above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFixtures.map((match) => {
            const isMatchLive = match.isLive || match.status === 'LIVE' || match.status === 'HT';

            return (
              <div
                key={match.id}
                onClick={() => onSelectFixture(match)}
                className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-[var(--primary-color)]/50 rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Glowing neon accent bar on hover/live */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 transition-opacity ${
                    isMatchLive
                      ? 'bg-gradient-to-r from-red-500 via-[var(--primary-color)] to-red-500 opacity-100'
                      : 'bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-0 group-hover:opacity-100'
                  }`}
                ></div>

                {/* Card Top: Competition & Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={match.competition.logoUrl}
                      alt={match.competition.name}
                      className="w-4 h-4 object-contain"
                    />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      {match.competition.shortName}
                    </span>
                  </div>

                  {/* Status Indicator */}
                  {isMatchLive ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="font-mono font-bold text-[10px] text-red-400 uppercase tracking-widest">
                        {match.status === 'HT' ? 'HT' : `${match.minute}' LIVE`}
                      </span>
                    </div>
                  ) : match.status === 'FT' ? (
                    <span className="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      FT
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-[10px] text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                      {new Date(match.startingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                {/* Score & Clubs Grid */}
                <div className="space-y-3 my-2">
                  {/* Home Team Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={match.homeTeam.logoUrl}
                        alt={match.homeTeam.name}
                        className="w-7 h-7 object-contain drop-shadow"
                      />
                      <span className="font-display font-bold uppercase text-sm md:text-base text-white group-hover:text-[var(--primary-color)] transition-colors">
                        {match.homeTeam.name}
                      </span>
                    </div>
                    <span className="font-display font-black text-xl md:text-2xl text-white">
                      {match.status === 'NS' ? '-' : match.score.home}
                    </span>
                  </div>

                  {/* Away Team Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={match.awayTeam.logoUrl}
                        alt={match.awayTeam.name}
                        className="w-7 h-7 object-contain drop-shadow"
                      />
                      <span className="font-display font-bold uppercase text-sm md:text-base text-white group-hover:text-[var(--primary-color)] transition-colors">
                        {match.awayTeam.name}
                      </span>
                    </div>
                    <span className="font-display font-black text-xl md:text-2xl text-white">
                      {match.status === 'NS' ? '-' : match.score.away}
                    </span>
                  </div>
                </div>

                {/* Goals / Events Ticker Snippet */}
                {match.events && match.events.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                    {match.events.filter(e => e.type === 'goal' || e.type === 'penalty_goal').slice(-2).map((ev) => (
                      <div key={ev.id} className="flex items-center gap-1.5 text-[11px] font-sans text-slate-300">
                        <i className="fa-solid fa-futbol text-emerald-400 text-[10px]"></i>
                        <span className="font-medium">{ev.player.name} {ev.minute}'</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Card Bottom: xG / Venue / Action button */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  {match.statistics?.xG ? (
                    <span className="font-mono text-[10px] text-slate-400">
                      xG: <strong className="text-white">{match.statistics.xG.home}</strong> vs <strong className="text-white">{match.statistics.xG.away}</strong>
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
                      {match.venue || 'Stadium TBA'}
                    </span>
                  )}

                  <div className="flex items-center gap-1.5 text-[var(--primary-color)] font-display font-bold uppercase tracking-wider text-[11px] group-hover:translate-x-1 transition-transform">
                    <span>Tactics</span>
                    <i className="fa-solid fa-angle-right text-[10px]"></i>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
