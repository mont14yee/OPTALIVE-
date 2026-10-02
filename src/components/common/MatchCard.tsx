import React from 'react';
import { Fixture } from '../../types/football';
import { TeamBadge } from './TeamBadge';

interface MatchCardProps {
  fixture: Fixture;
  onClick: (fixture: Fixture) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (fixtureId: string) => void;
  className?: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  onClick,
  isFavourite = false,
  onToggleFavourite,
  className = ''
}) => {
  const { homeTeam, awayTeam, score, status, minute, extraMinute, isLive, round, venue, statistics } = fixture;
  const isMatchLive = isLive || status === 'LIVE' || status === 'HT';

  const formatStatus = () => {
    if (status === 'HT') return 'HT';
    if (isMatchLive) return `${minute}'${extraMinute ? `+${extraMinute}'` : ''}`;
    if (status === 'FT') return 'FT';
    if (status === 'PST') return 'POSTPONED';
    if (status === 'CANC') return 'CANCELLED';
    return fixture.startTime || 'UPCOMING';
  };

  return (
    <div
      onClick={() => onClick(fixture)}
      className={`group relative bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-[var(--primary-color)]/50 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.7)] ${
        isMatchLive ? 'border-l-4 border-l-[var(--primary-color)]' : ''
      } ${className}`}
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between text-[11px] font-mono mb-3">
        <div className="flex items-center gap-2">
          {isMatchLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              {formatStatus()}
            </span>
          ) : status === 'FT' ? (
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 font-bold">
              FT
            </span>
          ) : status === 'PST' ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              POSTPONED
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold">
              {formatStatus()}
            </span>
          )}

          {round && <span className="text-slate-400 truncate max-w-[120px]">{round}</span>}
        </div>

        <div className="flex items-center gap-1.5">
          {statistics?.xG && (
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
              xG {statistics.xG.home} - {statistics.xG.away}
            </span>
          )}
          {onToggleFavourite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavourite(fixture.id);
              }}
              aria-label={isFavourite ? 'Remove from favorites' : 'Add to favorites'}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-amber-400 transition-colors"
            >
              <i className={`${isFavourite ? 'fa-solid text-amber-400' : 'fa-regular'} fa-star text-xs`} />
            </button>
          )}
        </div>
      </div>

      {/* Teams & Scores */}
      <div className="space-y-2.5">
        {/* Home Club */}
        <div className="flex items-center justify-between">
          <TeamBadge
            team={homeTeam}
            size="sm"
            showName={true}
            namePosition="right"
            className="flex-1 min-w-0"
          />
          <span
            className={`font-mono text-base font-black px-2 ${
              isMatchLive ? 'text-white' : status === 'FT' ? 'text-slate-200' : 'text-slate-400'
            }`}
          >
            {status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score?.home ?? 0}
          </span>
        </div>

        {/* Away Club */}
        <div className="flex items-center justify-between">
          <TeamBadge
            team={awayTeam}
            size="sm"
            showName={true}
            namePosition="right"
            className="flex-1 min-w-0"
          />
          <span
            className={`font-mono text-base font-black px-2 ${
              isMatchLive ? 'text-white' : status === 'FT' ? 'text-slate-200' : 'text-slate-400'
            }`}
          >
            {status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score?.away ?? 0}
          </span>
        </div>
      </div>

      {/* Footer Venue */}
      {venue && (
        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="truncate max-w-[200px]">
            <i className="fa-solid fa-location-dot mr-1 opacity-70" />
            {venue}
          </span>
          <span className="group-hover:text-[var(--primary-color)] transition-colors">
            Match Center →
          </span>
        </div>
      )}
    </div>
  );
};
