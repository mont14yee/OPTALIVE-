import React, { useState, useEffect } from 'react';
import { Team, Fixture, Competition, SearchPlayerItem } from '../types/football';
import { footballClient } from '../api/footballClient';
import { usePersonalization } from '../utils/personalization';

interface FavouritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTeam: (teamId: string) => void;
  onSelectFixture: (fixture: Fixture) => void;
  onSelectPlayer?: (playerId: string) => void;
  onSelectCompetition?: (competitionId: string) => void;
}

type FavTab = 'clubs' | 'leagues' | 'players' | 'settings';

export const FavouritesModal: React.FC<FavouritesModalProps> = ({
  isOpen,
  onClose,
  onSelectTeam,
  onSelectFixture,
  onSelectPlayer,
  onSelectCompetition
}) => {
  const [activeTab, setActiveTab] = useState<FavTab>('clubs');
  const [teams, setTeams] = useState<Team[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [allPlayers, setAllPlayers] = useState<SearchPlayerItem[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const {
    favouriteTeamIds,
    favouriteLeagueIds,
    favouritePlayerIds,
    prioritizeFavoritesOnHome,
    isFavouriteTeam,
    toggleFavouriteTeam,
    isFavouriteLeague,
    toggleFavouriteLeague,
    isFavouritePlayer,
    toggleFavouritePlayer,
    setPrioritizeFavoritesOnHome
  } = usePersonalization();

  // Load reference data on modal open
  useEffect(() => {
    if (isOpen) {
      footballClient.getAllTeams().then(setTeams).catch(() => {});
      footballClient.getCompetitions().then(setCompetitions).catch(() => {});
      footballClient.getFixtures('today').then(setFixtures).catch(() => {});
      footballClient.searchGlobal('', 'players').then((res) => setAllPlayers(res.players)).catch(() => {});
    } else {
      setFilterQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const fq = filterQuery.trim().toLowerCase();

  // 1. Favourite Clubs
  const pinnedTeams = teams.filter((t) => isFavouriteTeam(t.id));
  const suggestedTeams = teams.filter((t) => !isFavouriteTeam(t.id) && (!fq || t.name.toLowerCase().includes(fq) || t.shortName.toLowerCase().includes(fq)));

  // 2. Favourite Leagues
  const pinnedLeagues = competitions.filter((c) => isFavouriteLeague(c.id));
  const suggestedLeagues = competitions.filter((c) => !isFavouriteLeague(c.id) && (!fq || c.name.toLowerCase().includes(fq) || c.shortName.toLowerCase().includes(fq)));

  // 3. Favourite Players
  const pinnedPlayers = allPlayers.filter((p) => isFavouritePlayer(p.id));
  const suggestedPlayers = allPlayers.filter((p) => !isFavouritePlayer(p.id) && (!fq || p.name.toLowerCase().includes(fq) || (p.teamName && p.teamName.toLowerCase().includes(fq))));

  // Fixtures involving favourite teams
  const favouriteFixtures = fixtures.filter(
    (f) =>
      favouriteTeamIds.includes(f.homeTeam?.id?.toLowerCase()) ||
      favouriteTeamIds.includes(f.awayTeam?.id?.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Personalization & Favourites"
    >
      <div
        className="w-full max-w-2xl bg-slate-950 border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-3 sm:my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <i className="fa-solid fa-star text-base"></i>
            </div>
            <div>
              <h3 className="font-display font-bold uppercase text-base sm:text-lg text-white">
                Favourites & Personalization
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-widest">
                Local matchday preferences & tracked football entities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Favourites"
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-3 border-b border-white/10 bg-slate-900/40 overflow-x-auto no-scrollbar">
          {(
            [
              { id: 'clubs', label: `Clubs (${pinnedTeams.length})`, icon: 'fa-shield-halved' },
              { id: 'leagues', label: `Leagues (${pinnedLeagues.length})`, icon: 'fa-trophy' },
              { id: 'players', label: `Players (${pinnedPlayers.length})`, icon: 'fa-user-ninja' },
              { id: 'settings', label: 'Home Feed', icon: 'fa-sliders' }
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer whitespace-nowrap min-h-[38px] ${
                  isActive
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <i className={`fa-solid ${tab.icon} text-[11px]`}></i>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* 1. CLUBS TAB */}
          {activeTab === 'clubs' && (
            <div className="space-y-6">
              {/* Pinned Clubs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-star text-amber-400"></i>
                    <span>Pinned Clubs ({pinnedTeams.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Tap star to unpin</span>
                </div>

                {pinnedTeams.length === 0 ? (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <i className="fa-regular fa-star text-2xl text-slate-500"></i>
                    <p className="text-xs font-mono text-slate-400">No favorite clubs pinned yet.</p>
                    <p className="text-[11px] font-mono text-slate-500">Pin clubs from below to tailor your live scores and match calendar.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pinnedTeams.map((team) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <div
                          onClick={() => {
                            onClose();
                            onSelectTeam(team.id);
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                          ) : (
                            <i className="fa-solid fa-shield text-slate-500"></i>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-display font-bold text-white truncate hover:text-[var(--primary-color)] transition-colors">
                              {team.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">{team.country}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavouriteTeam(team.id)}
                          aria-label={`Unpin ${team.name}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-slate-400 hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <i className="fa-solid fa-star text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add More Clubs */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-plus text-slate-500"></i>
                  <span>Available Clubs to Pin</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedTeams.slice(0, 8).map((team) => (
                    <div
                      key={team.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {team.logoUrl ? (
                          <img src={team.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                        ) : (
                          <i className="fa-solid fa-shield text-slate-500 text-xs"></i>
                        )}
                        <span className="text-xs font-display font-bold text-white truncate">{team.name}</span>
                      </div>
                      <button
                        onClick={() => toggleFavouriteTeam(team.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-[11px] font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        + Pin
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. LEAGUES TAB */}
          {activeTab === 'leagues' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-trophy text-blue-400"></i>
                    <span>Tracked Leagues & Tournaments ({pinnedLeagues.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Tap star to unpin</span>
                </div>

                {pinnedLeagues.length === 0 ? (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <i className="fa-regular fa-trophy text-2xl text-slate-500"></i>
                    <p className="text-xs font-mono text-slate-400">No tournaments tracked yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pinnedLeagues.map((comp) => (
                      <div
                        key={comp.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <div
                          onClick={() => {
                            if (onSelectCompetition) {
                              onClose();
                              onSelectCompetition(comp.id);
                            }
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          {comp.logoUrl ? (
                            <img src={comp.logoUrl} alt="" className="w-6 h-6 object-contain flex-shrink-0" />
                          ) : (
                            <i className="fa-solid fa-trophy text-blue-400"></i>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-display font-bold text-white truncate hover:text-blue-400 transition-colors">
                              {comp.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">{comp.country}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavouriteLeague(comp.id)}
                          aria-label={`Unpin ${comp.name}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:text-slate-400 hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <i className="fa-solid fa-star text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Leagues */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-plus text-slate-500"></i>
                  <span>Available Tournaments to Track</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedLeagues.map((comp) => (
                    <div
                      key={comp.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {comp.logoUrl && <img src={comp.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />}
                        <span className="text-xs font-display font-bold text-white truncate">{comp.name}</span>
                      </div>
                      <button
                        onClick={() => toggleFavouriteLeague(comp.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-blue-400 hover:text-black text-[11px] font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        + Pin
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. PLAYERS TAB */}
          {activeTab === 'players' && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-user-ninja text-amber-400"></i>
                    <span>Tracked Players ({pinnedPlayers.length})</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">Tap star to unpin</span>
                </div>

                {pinnedPlayers.length === 0 ? (
                  <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5 space-y-2">
                    <i className="fa-regular fa-user text-2xl text-slate-500"></i>
                    <p className="text-xs font-mono text-slate-400">No players tracked yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {pinnedPlayers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        <div
                          onClick={() => {
                            if (onSelectPlayer) {
                              onClose();
                              onSelectPlayer(player.id);
                            }
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <div className="w-7 h-7 rounded-full bg-white/10 text-[10px] font-mono font-bold text-amber-400 flex items-center justify-center flex-shrink-0">
                            {player.number || '★'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-display font-bold text-white truncate hover:text-amber-400 transition-colors">
                              {player.name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 truncate">
                              {player.position} · {player.teamName || player.nationality}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFavouritePlayer(player.id)}
                          aria-label={`Unpin ${player.name}`}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-400 hover:text-slate-400 hover:bg-white/5 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <i className="fa-solid fa-star text-sm"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Star Players */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-plus text-slate-500"></i>
                  <span>Star Footballers to Follow</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {suggestedPlayers.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-display font-bold text-white truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">{p.teamName || p.position}</p>
                      </div>
                      <button
                        onClick={() => toggleFavouritePlayer(p.id)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-amber-400 hover:text-black text-[11px] font-mono font-bold text-slate-300 transition-colors cursor-pointer"
                      >
                        + Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. SETTINGS & HOME SCREEN PRIORITIZATION TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-display font-bold text-white flex items-center gap-2">
                      <i className="fa-solid fa-house-chimney-window text-[var(--primary-color)]"></i>
                      Prioritize Favourite Clubs on Home Feed
                    </p>
                    <p className="text-xs font-mono text-slate-400 leading-relaxed">
                      Automatically position live matches and fixtures involving your pinned clubs at the top of the Home Marquee and slate.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={prioritizeFavoritesOnHome}
                      onChange={(e) => setPrioritizeFavoritesOnHome(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]"></div>
                  </label>
                </div>
              </div>

              {/* Favourites in Action Today preview */}
              {favouriteFixtures.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-calendar-check text-emerald-400"></i>
                    <span>Your Clubs in Action Today ({favouriteFixtures.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {favouriteFixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        onClick={() => {
                          onClose();
                          onSelectFixture(fixture);
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-display font-bold text-white truncate">
                            {fixture.homeTeam?.name} vs {fixture.awayTeam?.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {fixture.competition?.name}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-[var(--primary-color)] font-bold">
                          {fixture.isLive ? 'LIVE NOW' : 'Scheduled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
