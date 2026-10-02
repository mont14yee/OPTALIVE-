import React from 'react';
import { Fixture } from '../../types/football';
import {
  formatKickoffTime,
  formatFixtureDate,
  getRelativeDayLabel,
  getUserTimezone,
  getTimezoneAbbreviation
} from '../../utils/footballDates';

interface ScheduleFixtureCardProps {
  fixture: Fixture;
  onSelect: (fixture: Fixture) => void;
  onSelectTeam?: (teamId: string) => void;
  timezone?: string;
}

export const ScheduleFixtureCard: React.FC<ScheduleFixtureCardProps> = ({
  fixture,
  onSelect,
  onSelectTeam,
  timezone = getUserTimezone()
}) => {
  const isLive = fixture.isLive || fixture.status === 'LIVE' || fixture.status === 'HT';
  const isFinished = fixture.status === 'FT' || fixture.status === 'AET' || fixture.status === 'PEN';
  const isPostponed = fixture.status === 'PST';
  const isCancelled = fixture.status === 'CANC' || fixture.status === 'SUSP';

  const kickoffTime = formatKickoffTime(fixture.startingAt, timezone);
  const displayDate = formatFixtureDate(fixture.startingAt, { includeDayOfWeek: true, includeYear: false, timezone });
  const relativeDay = getRelativeDayLabel(fixture.startingAt, timezone);
  const tzAbbr = getTimezoneAbbreviation(new Date(), timezone);

  // Status Badge Rendering
  const renderStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-[10px] font-black tracking-wider uppercase shadow-[0_0_10px_rgba(239,68,68,0.4)] animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          {fixture.status === 'HT' ? 'HALF TIME' : `${fixture.minute ?? 0}' LIVE`}
        </span>
      );
    }

    if (isFinished) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-white/20 text-slate-300 font-mono text-[10px] font-bold tracking-wider uppercase">
          <i className="fa-solid fa-flag-checkered text-[9px] text-slate-400"></i>
          FULL TIME
        </span>
      );
    }

    if (isPostponed) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold tracking-wider uppercase">
          <i className="fa-solid fa-triangle-exclamation text-[9px]"></i>
          POSTPONED
        </span>
      );
    }

    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold tracking-wider uppercase">
          <i className="fa-solid fa-ban text-[9px]"></i>
          CANCELLED
        </span>
      );
    }

    // Scheduled
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[var(--primary-color)] font-mono text-[10px] font-bold tracking-wider uppercase">
        <i className="fa-regular fa-clock text-[9px]"></i>
        {kickoffTime !== 'TBD' ? `${kickoffTime} ${tzAbbr}` : 'SCHEDULED'}
      </span>
    );
  };

  return (
    <div
      onClick={() => onSelect(fixture)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(fixture);
        }
      }}
      className={`group relative bg-slate-900/60 hover:bg-slate-900/90 border rounded-2xl md:rounded-3xl p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl hover:border-[var(--primary-color)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
        isLive ? 'border-red-500/30 bg-slate-950/70' : 'border-white/10'
      }`}
    >
      {/* Background Glow on Hover */}
      <div className="absolute inset-0 rounded-2xl md:rounded-3xl bg-gradient-to-r from-transparent via-[var(--primary-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Top Strip: Competition, Date & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3 mb-3 text-xs">
        {/* Competition */}
        <div className="flex items-center gap-2 min-w-0">
          {fixture.competition?.logoUrl && (
            <img
              src={fixture.competition.logoUrl}
              alt={fixture.competition.name || 'Competition'}
              className="w-4 h-4 object-contain flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <span className="font-display font-bold uppercase text-[11px] text-white tracking-wider truncate">
            {fixture.competition?.shortName || fixture.competition?.name || 'Match'}
          </span>
          {fixture.round && (
            <span className="hidden sm:inline text-slate-500 text-[10px] font-mono">
              • {fixture.round}
            </span>
          )}
        </div>

        {/* Date & Status */}
        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="font-mono text-[11px] text-slate-300 font-semibold block">
              {relativeDay ? `${relativeDay}, ${displayDate}` : displayDate}
            </span>
          </div>
          <div>{renderStatusBadge()}</div>
        </div>
      </div>

      {/* Main Center Matchup: Home Team, Score / Kickoff Time, Away Team */}
      <div className="grid grid-cols-12 items-center gap-2 py-1">
        {/* Home Team */}
        <div 
          onClick={(e) => {
            if (onSelectTeam && fixture.homeTeam?.id) {
              e.stopPropagation();
              onSelectTeam(fixture.homeTeam.id);
            }
          }}
          className="col-span-5 flex items-center justify-end gap-2.5 sm:gap-3 text-right cursor-pointer group/team"
          title={`View ${fixture.homeTeam?.name || 'Home Club'} profile`}
        >
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-black text-sm sm:text-base text-white group-hover/team:text-[var(--primary-color)] transition-colors truncate">
              {fixture.homeTeam?.name || 'Home Team'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
              {fixture.homeTeam?.code || 'HOME'}
            </span>
          </div>
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0 shadow-md group-hover/team:scale-110 group-hover/team:border-[var(--primary-color)]/50 transition-all">
            <img
              src={fixture.homeTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
              alt={fixture.homeTeam?.name || 'Home Team'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
              }}
            />
          </div>
        </div>

        {/* Score or Kickoff Time Center Box */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          {isLive || isFinished ? (
            <div className="px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 shadow-inner flex items-center gap-1.5 font-display font-black text-lg sm:text-xl tracking-tight">
              <span className={(fixture.score?.home ?? 0) > (fixture.score?.away ?? 0) ? 'text-[var(--primary-color)]' : 'text-white'}>
                {fixture.score?.home ?? 0}
              </span>
              <span className="text-slate-500 font-light text-sm">:</span>
              <span className={(fixture.score?.away ?? 0) > (fixture.score?.home ?? 0) ? 'text-[var(--primary-color)]' : 'text-white'}>
                {fixture.score?.away ?? 0}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center px-2 py-1 rounded-xl bg-white/5 border border-white/10">
              <span className="font-display font-black text-xs sm:text-sm text-white tracking-wider">
                {kickoffTime !== 'TBD' ? kickoffTime : 'VS'}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {tzAbbr}
              </span>
            </div>
          )}

          {/* Half time score if finished */}
          {isFinished && fixture.score?.halfTime && (
            <span className="text-[9px] font-mono text-slate-500 mt-1">
              HT {fixture.score.halfTime.home}-{fixture.score.halfTime.away}
            </span>
          )}
        </div>

        {/* Away Team */}
        <div 
          onClick={(e) => {
            if (onSelectTeam && fixture.awayTeam?.id) {
              e.stopPropagation();
              onSelectTeam(fixture.awayTeam.id);
            }
          }}
          className="col-span-5 flex items-center justify-start gap-2.5 sm:gap-3 text-left cursor-pointer group/team"
          title={`View ${fixture.awayTeam?.name || 'Away Club'} profile`}
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black/40 border border-white/10 p-1.5 flex items-center justify-center flex-shrink-0 shadow-md group-hover/team:scale-110 group-hover/team:border-[var(--primary-color)]/50 transition-all">
            <img
              src={fixture.awayTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
              alt={fixture.awayTeam?.name || 'Away Team'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-display font-black text-sm sm:text-base text-white group-hover/team:text-[var(--primary-color)] transition-colors truncate">
              {fixture.awayTeam?.name || 'Away Team'}
            </h4>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest hidden sm:block">
              {fixture.awayTeam?.code || 'AWAY'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Venue & Match Center CTA */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-3 border-t border-white/5 text-[11px] font-mono text-slate-400">
        {/* Venue */}
        <div className="flex items-center gap-1.5 truncate">
          <i className="fa-solid fa-location-dot text-slate-500 text-xs flex-shrink-0"></i>
          <span className="truncate">{fixture.venue || 'Stadium Venue TBD'}</span>
          {fixture.referee && (
            <span className="hidden md:inline text-slate-500">
              • Ref: {fixture.referee}
            </span>
          )}
        </div>

        {/* Match Center Prompt */}
        <div className="flex items-center gap-1 text-[var(--primary-color)] font-bold text-[10px] uppercase tracking-wider group-hover:translate-x-1 transition-transform flex-shrink-0">
          <span>Match Center</span>
          <i className="fa-solid fa-arrow-right text-[9px]"></i>
        </div>
      </div>
    </div>
  );
};
