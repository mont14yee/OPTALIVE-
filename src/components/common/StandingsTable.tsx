import React from 'react';
import { LeagueStandings } from '../../types/football';
import { TeamBadge } from './TeamBadge';

interface StandingsTableProps {
  standings: LeagueStandings;
  onSelectTeam?: (teamId: string) => void;
  className?: string;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({
  standings,
  onSelectTeam,
  className = ''
}) => {
  if (!standings || !standings.table || standings.table.length === 0) {
    return (
      <div className="py-12 text-center text-xs font-mono text-slate-400">
        No table data available for this competition.
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto no-scrollbar ${className}`}>
      <table className="w-full text-left border-collapse text-xs md:text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-black/40 text-[10px] md:text-[11px] font-mono uppercase tracking-wider text-slate-400">
            <th className="py-3 px-3 md:px-4 text-center w-12">#</th>
            <th className="py-3 px-3 md:px-4">Club</th>
            <th className="py-3 px-2 text-center">P</th>
            <th className="py-3 px-2 text-center">W</th>
            <th className="py-3 px-2 text-center">D</th>
            <th className="py-3 px-2 text-center">L</th>
            <th className="py-3 px-2 text-center hidden sm:table-cell">GF</th>
            <th className="py-3 px-2 text-center hidden sm:table-cell">GA</th>
            <th className="py-3 px-2 text-center">GD</th>
            <th className="py-3 px-3 md:px-4 text-center font-bold text-white">PTS</th>
            <th className="py-3 px-3 md:px-4 text-center hidden md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-sans">
          {standings.table.map((row) => {
            const zoneColor =
              row.zone === 'ucl'
                ? 'border-l-4 border-l-blue-500'
                : row.zone === 'uel'
                ? 'border-l-4 border-l-orange-500'
                : row.zone === 'uecl'
                ? 'border-l-4 border-l-emerald-500'
                : row.zone === 'relegation'
                ? 'border-l-4 border-l-red-500'
                : '';

            return (
              <tr
                key={row.position}
                onClick={() => onSelectTeam?.(row.team.id)}
                className={`hover:bg-white/5 transition-colors ${zoneColor} ${
                  onSelectTeam ? 'cursor-pointer' : ''
                }`}
              >
                <td className="py-3 px-3 md:px-4 text-center font-mono font-bold text-slate-300">
                  {row.position}
                </td>
                <td className="py-3 px-3 md:px-4">
                  <div className="flex items-center gap-2.5">
                    <TeamBadge
                      team={row.team}
                      size="xs"
                      showName={false}
                    />
                    <span className="font-display font-bold uppercase tracking-tight text-white hover:text-[var(--primary-color)] transition-colors">
                      {row.team.name}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-2 text-center font-mono text-slate-400">{row.played}</td>
                <td className="py-3 px-2 text-center font-mono text-slate-300">{row.won}</td>
                <td className="py-3 px-2 text-center font-mono text-slate-400">{row.drawn}</td>
                <td className="py-3 px-2 text-center font-mono text-slate-400">{row.lost}</td>
                <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                  {row.goalsFor}
                </td>
                <td className="py-3 px-2 text-center font-mono text-slate-400 hidden sm:table-cell">
                  {row.goalsAgainst}
                </td>
                <td className="py-3 px-2 text-center font-mono font-semibold">
                  <span
                    className={
                      row.goalDifference > 0
                        ? 'text-emerald-400'
                        : row.goalDifference < 0
                        ? 'text-rose-400'
                        : 'text-slate-400'
                    }
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </span>
                </td>
                <td className="py-3 px-3 md:px-4 text-center font-mono font-black text-white text-sm md:text-base">
                  {row.points}
                </td>
                <td className="py-3 px-3 md:px-4 text-center hidden md:table-cell">
                  <div className="flex items-center justify-center gap-1">
                    {row.form.map((f, i) => (
                      <span
                        key={i}
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-bold text-[9px] text-white ${
                          f === 'W'
                            ? 'bg-emerald-500'
                            : f === 'D'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
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
  );
};
