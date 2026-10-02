import React, { useState, useEffect } from 'react';
import { Competition, LeagueStandings } from '../types/football';
import { footballClient } from '../api/footballClient';
import { StandingsTable, LoadingState, EmptyState } from './common';

interface StandingsViewProps {
  competitions: Competition[];
  initialCompetitionId?: string;
  onSelectTeam?: (teamId: string) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  competitions,
  initialCompetitionId = 'epl',
  onSelectTeam
}) => {
  const [selectedCompId, setSelectedCompId] = useState(initialCompetitionId);
  const [standings, setStandings] = useState<LeagueStandings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    footballClient
      .getStandings(selectedCompId)
      .then((data) => {
        if (isMounted) {
          setStandings(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Standings fetch error:', err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCompId]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></span>
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold">
              Official League Tables
            </span>
          </div>
          <h2 className="font-display font-black text-2xl md:text-4xl uppercase text-white tracking-tight">
            League Standings
          </h2>
        </div>

        {/* League Selector Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {competitions.slice(0, 5).map((comp) => (
            <button
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all border cursor-pointer ${
                selectedCompId.toLowerCase() === comp.id.toLowerCase()
                  ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]'
                  : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-white/30'
              }`}
            >
              {comp.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Standings Table Card */}
      <div className="bg-slate-900/60 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            {standings?.competition.logoUrl && (
              <img
                src={standings.competition.logoUrl}
                alt={standings.competition.name}
                className="w-8 h-8 object-contain"
              />
            )}
            <div>
              <h3 className="font-display font-bold uppercase text-white text-base md:text-lg">
                {standings?.competition.name}
              </h3>
              <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                Season {standings?.season || '2024/25'} • Official Table
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Champions League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Europa League
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span> Relegation
            </span>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Synchronizing verified table data..." />
        ) : standings && standings.table.length > 0 ? (
          <StandingsTable standings={standings} onSelectTeam={onSelectTeam} />
        ) : (
          <EmptyState
            icon="fa-table-list"
            title="No Standings Available"
            description="Table data is not currently published for this tournament."
          />
        )}
      </div>
    </div>
  );
};
