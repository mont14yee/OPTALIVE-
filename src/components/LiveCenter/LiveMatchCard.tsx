import React from 'react';
import { Fixture, MatchEvent } from '../../types/football';

interface LiveMatchCardProps {
  fixture: Fixture;
  isFavorite: boolean;
  onToggleFavorite: (fixtureId: string) => void;
  onSelect: (fixture: Fixture) => void;
}

export const LiveMatchCard: React.FC<LiveMatchCardProps> = ({
  fixture,
  isFavorite,
  onToggleFavorite,
  onSelect
}) => {
  const {
    id,
    competition,
    homeTeam,
    awayTeam,
    score,
    status,
    minute,
    extraMinute,
    isLive,
    startingAt,
    venue,
    events
  } = fixture;

  const isMatchLive = isLive || status === 'LIVE' || status === 'HT' || status === 'AET' || status === 'PEN';

  // Group key match events
  const goalEvents = (events || []).filter(
    (e) => e.type === 'goal' || e.type === 'penalty_goal' || e.type === 'own_goal'
  );
  const cardEvents = (events || []).filter(
    (e) => e.type === 'yellow_card' || e.type === 'red_card'
  );
  const subEvents = (events || []).filter((e) => e.type === 'substitution');

  const homeGoals = goalEvents.filter((e) => e.teamId === homeTeam.id);
  const awayGoals = goalEvents.filter((e) => e.teamId === awayTeam.id);

  // Status Badge Component
  const renderStatusBadge = () => {
    switch (status) {
      case 'LIVE':
      case 'AET':
      case 'PEN':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[11px] font-mono font-bold text-red-400 tracking-wider">
              {minute ? `${minute}'` : 'LIVE'}{extraMinute ? `+${extraMinute}'` : ''}
            </span>
          </div>
        );
      case 'HT':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="text-[11px] font-mono font-bold text-amber-400 tracking-wider">
              HALF TIME
            </span>
          </div>
        );
      case 'FT':
        return (
          <div className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60">
            <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-wider">
              FULL TIME
            </span>
          </div>
        );
      case 'PST':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-600/50">
            <i className="fa-solid fa-clock-rotate-left text-[10px] text-amber-400"></i>
            <span className="text-[11px] font-mono font-bold text-amber-300 tracking-wider">
              POSTPONED
            </span>
          </div>
        );
      case 'CANC':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-600/50">
            <i className="fa-solid fa-ban text-[10px] text-rose-400"></i>
            <span className="text-[11px] font-mono font-bold text-rose-300 tracking-wider">
              CANCELLED
            </span>
          </div>
        );
      case 'SUSP':
        return (
          <div className="px-2.5 py-1 rounded-full bg-orange-950/60 border border-orange-600/50">
            <span className="text-[11px] font-mono font-bold text-orange-300 tracking-wider">
              SUSPENDED
            </span>
          </div>
        );
      case 'NS':
      default: {
        const dateObj = new Date(startingAt);
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/60 border border-white/10">
            <i className="fa-regular fa-clock text-[10px] text-slate-400"></i>
            <span className="text-[11px] font-mono font-semibold text-slate-300 tracking-wider">
              {timeStr}
            </span>
          </div>
        );
      }
    }
  };

  return (
    <div
      onClick={() => onSelect(fixture)}
      className="group relative bg-slate-900/65 hover:bg-slate-900/90 border border-white/10 hover:border-[var(--primary-color)]/50 rounded-2xl md:rounded-3xl p-5 md:p-6 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between overflow-hidden"
    >
      {/* Top glowing neon accent strip for live matches */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
          isMatchLive
            ? 'bg-gradient-to-r from-red-500 via-[var(--primary-color)] to-red-500 opacity-100'
            : 'bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Top Row: Competition, Favorite Toggle & Match State */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          {competition?.logoUrl && (
            <img
              src={competition.logoUrl}
              alt={competition.name || 'Competition'}
              className="w-4 h-4 object-contain flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          )}
          <span className="font-display font-bold uppercase text-[11px] md:text-xs tracking-wider text-slate-300 truncate">
            {competition?.name || 'Football Match'}
          </span>
          {fixture.round && (
            <span className="hidden sm:inline text-[10px] font-mono text-slate-500 truncate">
              • {fixture.round}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {renderStatusBadge()}
          <button
            type="button"
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(id);
            }}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
              isFavorite
                ? 'text-amber-400 bg-amber-400/20 hover:bg-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                : 'text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10'
            }`}
          >
            <i className={`fa-star text-xs ${isFavorite ? 'fa-solid' : 'fa-regular'}`} />
          </button>
        </div>
      </div>

      {/* Main Teams & Score Section */}
      <div className="py-2 space-y-3">
        {/* Home Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <img
              src={homeTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
              alt={homeTeam?.name || 'Home Club'}
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
              }}
            />
            <div className="min-w-0">
              <span className="font-display font-bold uppercase text-sm md:text-base text-white truncate block">
                {homeTeam?.name || 'Home Club'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                {homeTeam?.code || 'HOME'}
              </span>
            </div>
          </div>
          <span
            className={`font-display font-extrabold text-2xl md:text-3xl pl-3 ${
              isMatchLive ? 'text-white' : status === 'FT' ? 'text-slate-200' : 'text-slate-500'
            }`}
          >
            {status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score?.home ?? 0}
          </span>
        </div>

        {/* Away Team */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <img
              src={awayTeam?.logoUrl || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'}
              alt={awayTeam?.name || 'Away Club'}
              className="w-8 h-8 md:w-9 md:h-9 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] flex-shrink-0"
              onError={(e) => {
                e.currentTarget.src = 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg';
              }}
            />
            <div className="min-w-0">
              <span className="font-display font-bold uppercase text-sm md:text-base text-white truncate block">
                {awayTeam?.name || 'Away Club'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                {awayTeam?.code || 'AWAY'}
              </span>
            </div>
          </div>
          <span
            className={`font-display font-extrabold text-2xl md:text-3xl pl-3 ${
              isMatchLive ? 'text-white' : status === 'FT' ? 'text-slate-200' : 'text-slate-500'
            }`}
          >
            {status === 'NS' || status === 'PST' || status === 'CANC' ? '-' : score.away}
          </span>
        </div>
      </div>

      {/* Half-time score breakdown if available */}
      {score.halfTime && (
        <div className="text-[10px] font-mono text-slate-500 text-right pr-1">
          HT ({score.halfTime.home} - {score.halfTime.away})
        </div>
      )}

      {/* Match Incidents: Goals, Cards, Substitutions */}
      {(goalEvents.length > 0 || cardEvents.length > 0 || subEvents.length > 0) && (
        <div className="mt-4 pt-3 border-t border-white/5 space-y-1.5 text-xs font-mono">
          {/* Goals */}
          {goalEvents.length > 0 && (
            <div className="flex items-start gap-2 text-slate-300">
              <i className="fa-solid fa-futbol text-[11px] text-[var(--primary-color)] mt-0.5 flex-shrink-0" />
              <div className="flex-1 flex flex-wrap gap-x-2 text-[11px] leading-tight">
                {goalEvents.map((g) => (
                  <span key={g.id} className="text-slate-300">
                    <span className="text-white font-semibold">{g.player.name}</span>{' '}
                    <span className="text-slate-500">
                      {g.minute}'{g.type === 'penalty_goal' ? ' (P)' : g.type === 'own_goal' ? ' (OG)' : ''}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cards */}
          {cardEvents.length > 0 && (
            <div className="flex items-start gap-2 text-slate-400">
              <span className="flex-shrink-0 text-[11px] mt-0.5">🟨</span>
              <div className="flex-1 flex flex-wrap gap-x-2 text-[11px] leading-tight text-slate-400">
                {cardEvents.slice(0, 3).map((c) => (
                  <span key={c.id}>
                    <span className="text-slate-300">{c.player.name}</span>{' '}
                    <span className="text-slate-500">{c.minute}'</span>
                    {c.type === 'red_card' && <span className="text-rose-500 font-bold ml-0.5">(RED)</span>}
                  </span>
                ))}
                {cardEvents.length > 3 && (
                  <span className="text-slate-500">+{cardEvents.length - 3} more</span>
                )}
              </div>
            </div>
          )}

          {/* Substitutions */}
          {subEvents.length > 0 && (
            <div className="flex items-start gap-2 text-slate-400">
              <i className="fa-solid fa-arrows-rotate text-[10px] text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 flex flex-wrap gap-x-2 text-[11px] leading-tight text-slate-400">
                {subEvents.slice(-2).map((s) => (
                  <span key={s.id}>
                    <span className="text-slate-300">{s.subPlayerIn?.name || s.player.name}</span>{' '}
                    <span className="text-slate-500">{s.minute}'</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer: Venue & Match Center CTA */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="truncate max-w-[200px]">
          <i className="fa-solid fa-location-dot text-[10px] mr-1 text-slate-600" />
          {venue || 'Official Stadium'}
        </span>
        <span className="group-hover:text-[var(--primary-color)] transition-colors flex items-center gap-1 font-sans text-xs font-semibold">
          Match Center
          <i className="fa-solid fa-arrow-right text-[10px] transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};
