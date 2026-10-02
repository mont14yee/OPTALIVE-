import React from 'react';
import { Competition } from '../types/football';

interface CompetitionsBarProps {
  competitions: Competition[];
  selectedCompetitionId: string;
  onSelectCompetition: (id: string) => void;
}

export const CompetitionsBar: React.FC<CompetitionsBarProps> = ({
  competitions,
  selectedCompetitionId,
  onSelectCompetition
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-trophy text-[var(--primary-color)] text-xs"></i>
          <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
            Featured Competitions
          </span>
        </div>
        <button
          onClick={() => onSelectCompetition('all')}
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
            selectedCompetitionId === 'all'
              ? 'text-[var(--primary-color)] bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          View All
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-0.5">
        {/* All Leagues Pill */}
        <button
          onClick={() => onSelectCompetition('all')}
          className={`flex-shrink-0 w-24 h-24 rounded-2xl p-3 flex flex-col items-center justify-between border transition-all cursor-pointer relative overflow-hidden group ${
            selectedCompetitionId === 'all'
              ? 'bg-slate-900 border-[var(--primary-color)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] scale-[1.03]'
              : 'bg-slate-900/60 border-white/10 hover:border-white/30 hover:bg-slate-900/90'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 group-hover:text-[var(--primary-color)] transition-colors mt-1">
            <i className="fa-solid fa-globe text-lg"></i>
          </div>
          <span className="text-[10px] font-display font-bold uppercase tracking-wider text-slate-200">
            All Leagues
          </span>
        </button>

        {/* Competitions */}
        {competitions.map((comp) => {
          const isSelected = selectedCompetitionId.toLowerCase() === comp.id.toLowerCase();
          return (
            <button
              key={comp.id}
              onClick={() => onSelectCompetition(comp.id)}
              className={`flex-shrink-0 w-24 h-24 rounded-2xl p-3 flex flex-col items-center justify-between border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'border-[var(--primary-color)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)] scale-[1.03] bg-gradient-to-br ' + comp.colorGradient
                  : 'border-white/10 hover:border-white/30 bg-gradient-to-br ' + comp.colorGradient + ' opacity-90 hover:opacity-100'
              }`}
            >
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--primary-color)] shadow-[0_0_8px_var(--primary-color)]"></div>
              )}

              {comp?.logoUrl && (
                <img
                  src={comp.logoUrl}
                  alt={comp.name || 'Competition'}
                  className="w-11 h-11 object-contain drop-shadow-md relative z-10 transition-transform group-hover:scale-110 mt-0.5"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )}

              <span className="text-[9px] font-display font-black uppercase tracking-wider text-white relative z-10 text-center leading-tight drop-shadow">
                {comp?.shortName || comp?.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
