import React from 'react';
import { TopScorer } from '../../types/football';

interface LeagueTopScorersTabProps {
  topScorers: TopScorer[];
  loading: boolean;
  onSelectPlayer?: (playerId: string) => void;
  onSelectTeam?: (teamId: string) => void;
}

export const LeagueTopScorersTab: React.FC<LeagueTopScorersTabProps> = ({
  topScorers,
  loading,
  onSelectPlayer,
  onSelectTeam
}) => {
  if (loading) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-10 h-10 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mb-3"></div>
        <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">
          Fetching Golden Boot Leaderboard...
        </span>
      </div>
    );
  }

  if (!topScorers || topScorers.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-10 text-center">
        <i className="fa-solid fa-ranking-star text-slate-500 text-3xl mb-3"></i>
        <h4 className="font-display font-bold text-white uppercase text-base">
          Scorer Data Pending
        </h4>
        <p className="font-mono text-xs text-slate-400 mt-1">
          Top scorer rankings for this season will update once confirmed matches are recorded.
        </p>
      </div>
    );
  }

  const leader = topScorers[0];
  const podium = topScorers.slice(0, 3);
  const others = topScorers.slice(3);

  return (
    <div className="space-y-6">
      {/* Top Scorer Hero / Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {podium.map((scorer, idx) => {
          const isFirst = idx === 0;
          return (
            <div
              key={scorer.player.id || idx}
              className={`relative bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between overflow-hidden shadow-xl backdrop-blur-md ${
                isFirst
                  ? 'md:scale-105 border-[var(--primary-color)] bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_25px_rgba(var(--primary-rgb),0.2)] order-first md:order-2'
                  : 'border-white/10 order-2 md:order-1'
              }`}
            >
              {isFirst && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-color)]/10 rounded-full blur-2xl pointer-events-none"></div>
              )}

              {/* Rank & Team Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`w-7 h-7 rounded-xl font-display font-black text-xs flex items-center justify-center ${
                    idx === 0
                      ? 'bg-[var(--primary-color)] text-black shadow-[0_0_12px_var(--primary-color)]'
                      : idx === 1
                      ? 'bg-slate-300 text-slate-900'
                      : 'bg-amber-700/80 text-white'
                  }`}
                >
                  #{idx + 1}
                </span>

                <div 
                  onClick={() => onSelectTeam && onSelectTeam(scorer.team.id)}
                  className="flex items-center gap-1.5 bg-white/5 hover:bg-white/15 px-2.5 py-1 rounded-full border border-white/10 cursor-pointer transition-colors"
                >
                  {scorer.team.logoUrl && (
                    <img src={scorer.team.logoUrl} alt="" className="w-4 h-4 object-contain" />
                  )}
                  <span className="font-display font-bold uppercase text-[10px] text-slate-300">
                    {scorer.team.shortName || scorer.team.name}
                  </span>
                </div>
              </div>

              {/* Player Info */}
              <div 
                onClick={() => onSelectPlayer && onSelectPlayer(scorer.player.id)}
                className="text-center my-3 cursor-pointer group"
              >
                <div className="relative inline-block mb-3">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-white/5 p-1 border flex items-center justify-center overflow-hidden mx-auto shadow-md group-hover:scale-105 transition-transform ${
                      isFirst ? 'border-[var(--primary-color)]' : 'border-white/15'
                    }`}
                  >
                    {scorer.player.photoUrl ? (
                      <img
                        src={scorer.player.photoUrl}
                        alt={scorer.player.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <i className="fa-solid fa-user-ninja text-2xl text-slate-400"></i>
                    )}
                  </div>
                  {scorer.player.number && (
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-slate-950 border border-white/20 font-mono text-[9px] text-slate-300">
                      #{scorer.player.number}
                    </span>
                  )}
                </div>

                <h4 className="font-display font-black uppercase text-base text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
                  {scorer.player.name}
                </h4>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                  {scorer.player.position || 'Forward'}
                </p>
              </div>

              {/* Key Stats Bar */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-3 gap-1 text-center font-mono">
                <div>
                  <span className="block text-xl md:text-2xl font-display font-black text-[var(--primary-color)]">
                    {scorer.goals}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">Goals</span>
                </div>
                <div>
                  <span className="block text-xl md:text-2xl font-display font-black text-white">
                    {scorer.assists ?? 0}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">Assists</span>
                </div>
                <div>
                  <span className="block text-xl md:text-2xl font-display font-black text-slate-300">
                    {scorer.appearances ?? '-'}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider">Apps</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Scorers Table */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-fire text-[var(--primary-color)] text-sm"></i>
            <h3 className="font-display font-black uppercase text-white text-base md:text-lg tracking-tight">
              Golden Boot Leaderboard
            </h3>
          </div>
          <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
            {topScorers.length} Ranked Scorers
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase text-slate-400 tracking-wider">
                <th className="py-3 px-4 text-center w-12">#</th>
                <th className="py-3 px-4">Player</th>
                <th className="py-3 px-4">Club</th>
                <th className="py-3 px-4 text-center">Apps</th>
                <th className="py-3 px-4 text-center">Assists</th>
                <th className="py-3 px-4 text-center">Penalties</th>
                <th className="py-3 px-4 text-center font-bold text-white">Goals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {topScorers.map((scorer, i) => (
                <tr key={scorer.player.id || i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-display font-black ${
                        i === 0
                          ? 'bg-[var(--primary-color)] text-black'
                          : i === 1
                          ? 'bg-slate-300 text-slate-900'
                          : i === 2
                          ? 'bg-amber-700/80 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {scorer.position || i + 1}
                    </span>
                  </td>

                  <td 
                    onClick={() => onSelectPlayer && onSelectPlayer(scorer.player.id)}
                    className="py-3.5 px-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 p-0.5 flex items-center justify-center flex-shrink-0 group-hover:border group-hover:border-[var(--primary-color)] transition-colors">
                        {scorer.player.photoUrl ? (
                          <img
                            src={scorer.player.photoUrl}
                            alt=""
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <i className="fa-solid fa-user text-slate-400 text-xs"></i>
                        )}
                      </div>
                      <div>
                        <span className="font-display font-bold uppercase text-white group-hover:text-[var(--primary-color)] text-xs sm:text-sm block transition-colors">
                          {scorer.player.name}
                        </span>
                        <span className="text-[9px] text-slate-400 uppercase">
                          {scorer.player.position || 'Forward'}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td 
                    onClick={() => onSelectTeam && onSelectTeam(scorer.team.id)}
                    className="py-3.5 px-4 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      {scorer.team.logoUrl && (
                        <img src={scorer.team.logoUrl} alt="" className="w-4 h-4 object-contain" />
                      )}
                      <span className="text-slate-300 group-hover:text-[var(--primary-color)] text-xs truncate transition-colors">
                        {scorer.team.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-center text-slate-400 font-semibold">
                    {scorer.appearances ?? '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {scorer.assists ?? 0}
                  </td>
                  <td className="py-3.5 px-4 text-center text-slate-400">
                    {scorer.penalties ?? 0}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="font-display font-black text-sm text-[var(--primary-color)]">
                      {scorer.goals}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
