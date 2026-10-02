import React from 'react';
import { MatchEvent as MatchEventType } from '../../types/football';

interface MatchEventProps {
  event: MatchEventType;
  isHomeTeam: boolean;
  className?: string;
  onClickPlayer?: (playerName: string) => void;
}

export const MatchEvent: React.FC<MatchEventProps> = ({
  event,
  isHomeTeam,
  className = '',
  onClickPlayer
}) => {
  const getEventIcon = (type: MatchEventType['type']) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'penalty_goal':
        return '🥅';
      case 'own_goal':
        return '🤦';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '⇄';
      case 'var':
        return '📺';
      case 'woodwork':
        return '🎯';
      default:
        return '⚡';
    }
  };

  return (
    <div
      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
        isHomeTeam
          ? 'bg-slate-900/70 border-l-4 border-l-[var(--primary-color)] border-white/5'
          : 'bg-slate-900/70 border-r-4 border-r-cyan-400 border-white/5'
      } ${className}`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="font-mono font-bold text-xs text-slate-300 w-10 text-center py-1 bg-black/40 rounded-lg flex-shrink-0">
          {event.minute}'{event.extraMinute ? `+${event.extraMinute}` : ''}
        </span>

        <span className="text-base flex-shrink-0" aria-hidden="true">
          {getEventIcon(event.type)}
        </span>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              onClick={() => onClickPlayer?.(event.playerName)}
              className={`font-display font-bold text-xs sm:text-sm text-white truncate ${
                onClickPlayer ? 'hover:text-[var(--primary-color)] cursor-pointer' : ''
              }`}
            >
              {event.playerName}
            </span>
            {event.assistPlayerName && (
              <span className="text-[11px] font-mono text-slate-400 truncate">
                (ast. {event.assistPlayerName})
              </span>
            )}
            {event.subPlayerIn && (
              <span className="text-[11px] font-mono text-emerald-400 truncate">
                in: {event.subPlayerIn}
              </span>
            )}
          </div>
          {event.detail && (
            <p className="text-[10px] font-mono text-slate-400 truncate max-w-sm mt-0.5">
              {event.detail}
            </p>
          )}
        </div>
      </div>

      <span
        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${
          isHomeTeam
            ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] border border-[var(--primary-color)]/30'
            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
        }`}
      >
        {isHomeTeam ? 'HOME' : 'AWAY'}
      </span>
    </div>
  );
};
