import React from 'react';
import { Player } from '../../types/football';

interface LineupPlayerProps {
  player: Player;
  isHomeTeam?: boolean;
  onClick?: () => void;
  variant?: 'pitch' | 'row';
  className?: string;
}

export const LineupPlayer: React.FC<LineupPlayerProps> = ({
  player,
  isHomeTeam = true,
  onClick,
  variant = 'pitch',
  className = ''
}) => {
  const shortName = player.shortName || player.name.split(' ').pop() || player.name;

  if (variant === 'row') {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-slate-900/40 hover:bg-slate-900 transition-colors ${
          onClick ? 'cursor-pointer group' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-white/10 font-mono font-bold text-xs flex items-center justify-center text-slate-300">
            {player.number}
          </span>
          <div>
            <span className="font-display font-semibold text-xs text-white group-hover:text-[var(--primary-color)] transition-colors">
              {player.name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 ml-2 uppercase">
              {player.position}
            </span>
          </div>
        </div>

        {player.rating && (
          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-[var(--primary-color)] border border-[var(--primary-color)]/30">
            {player.rating}
          </span>
        )}
      </div>
    );
  }

  // Pitch circular badge variant
  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center group relative m-1 transition-transform ${
        onClick ? 'cursor-pointer hover:scale-110' : ''
      } ${className}`}
      title={`${player.name} (#${player.number})`}
    >
      <div
        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-display font-bold text-xs flex items-center justify-center border border-white/50 shadow-md ${
          isHomeTeam
            ? 'bg-[var(--primary-color)] text-black'
            : 'bg-cyan-400 text-black'
        }`}
      >
        {player.number}
      </div>

      <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-white drop-shadow truncate max-w-[65px] sm:max-w-[75px] mt-0.5 group-hover:text-[var(--primary-color)] transition-colors text-center">
        {shortName}
      </span>

      {player.rating && (
        <span className="text-[8px] sm:text-[9px] font-mono px-1 rounded bg-black/70 text-[var(--primary-color)] border border-[var(--primary-color)]/30 scale-90">
          {player.rating}
        </span>
      )}
    </div>
  );
};
