import React from 'react';

interface StatBarProps {
  label: string;
  homeValue: number | string;
  awayValue: number | string;
  homePercentage?: number;
  highlightLeader?: boolean;
  className?: string;
}

export const StatBar: React.FC<StatBarProps> = ({
  label,
  homeValue,
  awayValue,
  homePercentage,
  highlightLeader = true,
  className = ''
}) => {
  // Calculate percentage if not provided
  let calculatedHomePct = homePercentage;
  if (calculatedHomePct === undefined) {
    const numHome = typeof homeValue === 'number' ? homeValue : parseFloat(String(homeValue)) || 0;
    const numAway = typeof awayValue === 'number' ? awayValue : parseFloat(String(awayValue)) || 0;
    const total = numHome + numAway;
    calculatedHomePct = total > 0 ? (numHome / total) * 100 : 50;
  }

  const safeHomePct = Math.max(0, Math.min(100, calculatedHomePct));
  const safeAwayPct = 100 - safeHomePct;

  const numH = typeof homeValue === 'number' ? homeValue : parseFloat(String(homeValue));
  const numA = typeof awayValue === 'number' ? awayValue : parseFloat(String(awayValue));

  const isHomeGreater = !isNaN(numH) && !isNaN(numA) && numH > numA;
  const isAwayGreater = !isNaN(numH) && !isNaN(numA) && numA > numH;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex justify-between items-center text-xs font-mono">
        <span
          className={`font-bold transition-colors ${
            highlightLeader && isHomeGreater
              ? 'text-[var(--primary-color)]'
              : 'text-slate-300'
          }`}
        >
          {homeValue}
        </span>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`font-bold transition-colors ${
            highlightLeader && isAwayGreater ? 'text-cyan-400' : 'text-slate-300'
          }`}
        >
          {awayValue}
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
        <div
          style={{ width: `${safeHomePct}%` }}
          className="bg-[var(--primary-color)] h-full transition-all duration-300"
        />
        <div
          style={{ width: `${safeAwayPct}%` }}
          className="bg-cyan-400 h-full transition-all duration-300"
        />
      </div>
    </div>
  );
};
