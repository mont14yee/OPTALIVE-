import React from 'react';
import { LeagueStandings } from '../../types/football';
import { StandingsTable, LoadingState, EmptyState } from '../common';

interface LeagueTableTabProps {
  standings: LeagueStandings | null;
  loading: boolean;
  onSelectTeam?: (teamId: string) => void;
}

export const LeagueTableTab: React.FC<LeagueTableTabProps> = ({ standings, loading, onSelectTeam }) => {
  if (loading) {
    return <LoadingState message="Loading Official Standings..." />;
  }

  if (!standings || !standings.table || standings.table.length === 0) {
    return (
      <EmptyState
        icon="fa-table-list"
        title="Standings Currently Unavailable"
        description="The table for this tournament is either in tournament knockout format or pending update."
      />
    );
  }

  return (
    <div className="bg-slate-900/60 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Header Info */}
      <div className="p-4 md:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></span>
            <h3 className="font-display font-black uppercase text-white text-base md:text-xl tracking-tight">
              {standings.competition.name} Table
            </h3>
          </div>
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
            Season {standings.season || '2024/25'} • Official Table Rankings
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-blue-500"></span> Champions League
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-amber-500"></span> Europa League
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-red-500"></span> Relegation
          </span>
        </div>
      </div>

      {/* Reusable Standings Table */}
      <StandingsTable standings={standings} onSelectTeam={onSelectTeam} />
    </div>
  );
};
