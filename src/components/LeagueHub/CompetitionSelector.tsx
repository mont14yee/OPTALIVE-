import React from 'react';
import { Competition } from '../../types/football';

interface CompetitionSelectorProps {
  competitions: Competition[];
  selectedCompetitionId: string;
  onSelectCompetition: (id: string) => void;
}

export const CompetitionSelector: React.FC<CompetitionSelectorProps> = ({
  competitions,
  selectedCompetitionId,
  onSelectCompetition
}) => {
  return (
    <div className="w-full">
      {/* Scrollable Competition Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {competitions.map((comp) => {
          const isSelected = selectedCompetitionId.toLowerCase() === comp.id.toLowerCase();
          return (
            <button
              key={comp.id}
              onClick={() => onSelectCompetition(comp.id)}
              className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-2xl transition-all duration-300 border flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 border-[var(--primary-color)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.35)] scale-[1.02]'
                  : 'bg-slate-900/60 border-white/10 hover:border-white/25 hover:bg-slate-900/90 text-slate-300'
              }`}
            >
              {comp.logoUrl ? (
                <div className="w-6 h-6 rounded-lg bg-white/5 p-0.5 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={comp.logoUrl}
                    alt={comp.name}
                    className="w-full h-full object-contain filter group-hover:brightness-110"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 text-xs">
                  <i className="fa-solid fa-trophy"></i>
                </div>
              )}

              <div className="text-left">
                <span
                  className={`block font-display font-bold uppercase text-xs tracking-wider transition-colors ${
                    isSelected ? 'text-[var(--primary-color)]' : 'text-slate-200 group-hover:text-white'
                  }`}
                >
                  {comp.shortName || comp.name}
                </span>
                <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-widest -mt-0.5">
                  {comp.country || 'Global'}
                </span>
              </div>

              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] shadow-[0_0_8px_var(--primary-color)] ml-1"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
