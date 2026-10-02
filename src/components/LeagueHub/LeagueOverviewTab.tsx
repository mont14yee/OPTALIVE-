import React from 'react';
import { Fixture, LeagueStandings } from '../../types/football';

interface LeagueOverviewTabProps {
  standings: LeagueStandings | null;
  fixtures: Fixture[];
  onSelectFixture: (fixture: Fixture) => void;
  onViewAllMatches: () => void;
  onViewTable: () => void;
  onSelectTeam?: (teamId: string) => void;
}

export const LeagueOverviewTab: React.FC<LeagueOverviewTabProps> = ({
  standings,
  fixtures,
  onSelectFixture,
  onViewAllMatches,
  onViewTable,
  onSelectTeam
}) => {
  // Derive match categories
  const liveMatches = fixtures.filter((f) => f.isLive || f.status === 'LIVE' || f.status === 'HT');
  const pastMatches = fixtures.filter((f) => f.status === 'FT');
  const upcomingMatches = fixtures.filter((f) => f.status === 'NS');

  // Leaders (Top 3 from standings)
  const leaders = standings?.table.slice(0, 3) || [];
  const leader = leaders[0];

  // Current matchday / round from fixtures or standings
  const activeRound = fixtures[0]?.round || standings?.competition.season || 'Current Season';

  return (
    <div className="space-y-6">
      {/* League Pulse Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Matchday & Status Card */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col justify-between backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/5 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--primary-color)] animate-ping"></span>
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                Competition Status
              </span>
            </div>
            <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
              {activeRound}
            </h3>
            <p className="font-mono text-xs text-slate-400 mt-1">
              Season {standings?.season || '2024/25'} • {fixtures.length} Registered Fixtures
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Live Fixtures</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                liveMatches.length > 0
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {liveMatches.length > 0 ? `${liveMatches.length} IN PLAY` : 'None in play'}
            </span>
          </div>
        </div>

        {/* Current Leader Card */}
        {leader && (
          <div className="md:col-span-2 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-white/10 rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/15 p-2 flex items-center justify-center shadow-lg">
                  {leader.team.logoUrl ? (
                    <img
                      src={leader.team.logoUrl}
                      alt={leader.team.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <i className="fa-solid fa-shield text-2xl text-slate-400"></i>
                  )}
                </div>
                <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[var(--primary-color)] text-black font-display font-black text-xs flex items-center justify-center shadow-[0_0_10px_var(--primary-color)]">
                  1
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[10px] text-[var(--primary-color)] uppercase tracking-widest font-bold">
                    Table Leaders
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">• GD {leader.goalDifference > 0 ? `+${leader.goalDifference}` : leader.goalDifference}</span>
                </div>
                <h4 className="font-display font-black text-lg md:text-xl text-white uppercase tracking-tight">
                  {leader.team.name}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs font-mono text-slate-300">
                  <span><strong>{leader.points}</strong> PTS</span>
                  <span><strong>{leader.played}</strong> P</span>
                  <span><strong>{leader.won}</strong> W</span>
                  <span><strong>{leader.drawn}</strong> D</span>
                  <span><strong>{leader.lost}</strong> L</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
              <div className="flex items-center gap-1">
                {leader.form?.map((f, i) => (
                  <span
                    key={i}
                    className={`w-5 h-5 rounded text-[10px] font-mono font-bold flex items-center justify-center ${
                      f === 'W'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : f === 'D'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {f}
                  </span>
                ))}
              </div>
              <button
                onClick={onViewTable}
                className="text-xs font-mono text-[var(--primary-color)] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
              >
                Full Standings <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Matches Section (If any) */}
      {liveMatches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <h3 className="font-display font-bold uppercase text-white tracking-wider text-sm md:text-base">
                Matches In Play
              </h3>
            </div>
            <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest font-semibold">
              Live Updates
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {liveMatches.map((match) => (
              <div
                key={match.id}
                onClick={() => onSelectFixture(match)}
                className="bg-slate-900/80 border border-red-500/40 rounded-2xl p-4 hover:border-red-500 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-slate-400">{match.round || 'League Match'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/40 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                    {match.minute ? `${match.minute}'` : 'LIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                      {match.homeTeam.logoUrl && (
                        <img src={match.homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="font-display font-bold uppercase text-sm text-white truncate">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-slate-950/80 border border-white/10 rounded-xl font-display font-black text-lg text-white mx-3 shadow-inner">
                    {match.score.home} - {match.score.away}
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className="font-display font-bold uppercase text-sm text-white truncate text-right">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                      {match.awayTeam.logoUrl && (
                        <img src={match.awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid: Next Fixtures & Latest Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Fixtures */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <i className="fa-regular fa-clock text-[var(--primary-color)] text-xs"></i>
              <h3 className="font-display font-bold uppercase text-white tracking-wider text-sm">
                Next Fixtures
              </h3>
            </div>
            <button
              onClick={onViewAllMatches}
              className="text-[10px] font-mono font-bold text-slate-400 hover:text-[var(--primary-color)] uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All ({upcomingMatches.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingMatches.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 py-6 text-center">
                No upcoming fixtures scheduled at the moment.
              </p>
            ) : (
              upcomingMatches.slice(0, 4).map((match) => (
                <div
                  key={match.id}
                  onClick={() => onSelectFixture(match)}
                  className="bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 hover:border-white/20 rounded-xl p-3 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded bg-white/5 p-0.5 flex items-center justify-center flex-shrink-0">
                      {match.homeTeam.logoUrl && (
                        <img src={match.homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="font-display font-bold text-xs text-white uppercase truncate">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>

                  <div className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-mono text-slate-300 font-semibold mx-2 text-center flex-shrink-0 group-hover:bg-[var(--primary-color)] group-hover:text-black transition-colors">
                    {match.startingAt
                      ? new Date(match.startingAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'VS'}
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className="font-display font-bold text-xs text-white uppercase truncate text-right">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                    <div className="w-6 h-6 rounded bg-white/5 p-0.5 flex items-center justify-center flex-shrink-0">
                      {match.awayTeam.logoUrl && (
                        <img src={match.awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Results */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 md:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-flag-checkered text-[var(--primary-color)] text-xs"></i>
              <h3 className="font-display font-bold uppercase text-white tracking-wider text-sm">
                Latest Results
              </h3>
            </div>
            <button
              onClick={onViewAllMatches}
              className="text-[10px] font-mono font-bold text-slate-400 hover:text-[var(--primary-color)] uppercase tracking-wider transition-colors cursor-pointer"
            >
              View All ({pastMatches.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {pastMatches.length === 0 ? (
              <p className="text-xs font-mono text-slate-400 py-6 text-center">
                No completed match results recorded yet.
              </p>
            ) : (
              pastMatches.slice(0, 4).map((match) => (
                <div
                  key={match.id}
                  onClick={() => onSelectFixture(match)}
                  className="bg-slate-950/40 hover:bg-slate-950/80 border border-white/5 hover:border-white/20 rounded-xl p-3 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-6 h-6 rounded bg-white/5 p-0.5 flex items-center justify-center flex-shrink-0">
                      {match.homeTeam.logoUrl && (
                        <img src={match.homeTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <span className="font-display font-bold text-xs text-white uppercase truncate">
                      {match.homeTeam.shortName || match.homeTeam.name}
                    </span>
                  </div>

                  <div className="px-3 py-1 rounded-lg bg-white/10 font-display font-black text-xs text-white mx-2 flex-shrink-0 shadow-sm group-hover:border group-hover:border-[var(--primary-color)] transition-colors">
                    {match.score.home} - {match.score.away}
                  </div>

                  <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
                    <span className="font-display font-bold text-xs text-white uppercase truncate text-right">
                      {match.awayTeam.shortName || match.awayTeam.name}
                    </span>
                    <div className="w-6 h-6 rounded bg-white/5 p-0.5 flex items-center justify-center flex-shrink-0">
                      {match.awayTeam.logoUrl && (
                        <img src={match.awayTeam.logoUrl} alt="" className="w-full h-full object-contain" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
