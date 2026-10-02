import React, { useState } from 'react';
import { Team } from '../../types/football';

interface LeagueTeamsTabProps {
  teams: Team[];
  loading: boolean;
  onSelectTeam?: (teamId: string) => void;
}

export const LeagueTeamsTab: React.FC<LeagueTeamsTabProps> = ({ teams, loading, onSelectTeam }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">
          Loading Participating Clubs...
        </span>
      </div>
    );
  }

  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.shortName && t.shortName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.code && t.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.manager && t.manager.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.stadium && t.stadium.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h3 className="font-display font-black uppercase text-white text-base md:text-lg tracking-tight">
            Participating Clubs ({teams.length})
          </h3>
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            Verified tournament clubs, home venues and managerial staff
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
          <input
            type="text"
            placeholder="Search club, stadium, manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[var(--primary-color)] transition-colors"
          />
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length === 0 ? (
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-10 text-center">
          <i className="fa-solid fa-shield-halved text-slate-500 text-3xl mb-3"></i>
          <h4 className="font-display font-bold text-white uppercase text-base">No Clubs Found</h4>
          <p className="font-mono text-xs text-slate-400 mt-1">
            No participating clubs match your query "{searchTerm}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              onClick={() => onSelectTeam && onSelectTeam(team.id)}
              className="group bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 transition-all duration-300 shadow-lg flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10 flex-shrink-0 group-hover:scale-105 group-hover:border-[var(--primary-color)] transition-all">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <i className="fa-solid fa-shield text-slate-400 text-xl"></i>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display font-bold uppercase text-white text-base truncate group-hover:text-[var(--primary-color)] transition-colors">
                      {team.name}
                    </h4>
                    {team.code && (
                      <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-bold text-slate-300 flex-shrink-0">
                        {team.code}
                      </span>
                    )}
                  </div>
                  <span className="block font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                    {team.country || 'Football Club'}
                  </span>
                </div>
              </div>

              {/* Club Specs */}
              <div className="pt-3 border-t border-white/5 space-y-1.5 text-[11px] font-mono">
                {team.stadium && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <i className="fa-regular fa-building text-[10px]"></i> Venue:
                    </span>
                    <span className="truncate max-w-[170px] text-right font-medium">
                      {team.stadium}
                    </span>
                  </div>
                )}
                {team.manager && (
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <i className="fa-solid fa-user-tie text-[10px]"></i> Manager:
                    </span>
                    <span className="truncate max-w-[170px] text-right font-medium">
                      {team.manager}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
