import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Competition, Fixture, Team, SearchPlayerItem, GlobalSearchResult } from '../types/football';
import { footballClient } from '../api/footballClient';
import { usePersonalization } from '../utils/personalization';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitions: Competition[];
  onSelectTeam: (teamId: string) => void;
  onSelectPlayer: (playerId: string) => void;
  onSelectFixture: (fixture: Fixture) => void;
  onSelectCompetition: (competitionId: string) => void;
}

type SearchCategory = 'all' | 'teams' | 'players' | 'competitions' | 'fixtures';

type NavigableItem =
  | { type: 'team'; id: string; data: Team }
  | { type: 'player'; id: string; data: SearchPlayerItem }
  | { type: 'competition'; id: string; data: Competition }
  | { type: 'fixture'; id: string; data: Fixture };

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  competitions,
  onSelectTeam,
  onSelectPlayer,
  onSelectFixture,
  onSelectCompetition
}) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GlobalSearchResult>({
    teams: [],
    players: [],
    competitions: [],
    fixtures: []
  });
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const {
    recentSearches,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    isFavouriteTeam,
    toggleFavouriteTeam,
    isFavouriteLeague,
    toggleFavouriteLeague,
    isFavouritePlayer,
    toggleFavouritePlayer,
    favouriteTeamIds,
    favouriteLeagueIds,
    favouritePlayerIds
  } = usePersonalization();

  // Reset and focus when modal opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(-1);
      setError(null);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      // Pre-seed initial default search result
      footballClient.searchGlobal('', 'all')
        .then((res) => {
          setSearchResults(res);
        })
        .catch(() => {});
      return () => clearTimeout(timer);
    } else {
      setQuery('');
      setHighlightedIndex(-1);
      setError(null);
    }
  }, [isOpen]);

  // Debounced search query
  const performSearch = useCallback(async (searchTerm: string, category: SearchCategory) => {
    setLoading(true);
    setError(null);
    try {
      const results = await footballClient.searchGlobal(searchTerm, category);
      setSearchResults(results);
      setHighlightedIndex(-1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search request failed. Please check network connection.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timeoutId = setTimeout(() => {
      performSearch(query, selectedCategory);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [query, selectedCategory, performSearch, isOpen]);

  // Flattened navigable list based on current active category and results
  const flatNavList: NavigableItem[] = useMemo(() => {
    const list: NavigableItem[] = [];

    if (selectedCategory === 'all' || selectedCategory === 'teams') {
      searchResults.teams.forEach((t) => list.push({ type: 'team', id: t.id, data: t }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'players') {
      searchResults.players.forEach((p) => list.push({ type: 'player', id: p.id, data: p }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'competitions') {
      searchResults.competitions.forEach((c) => list.push({ type: 'competition', id: c.id, data: c }));
    }
    if (selectedCategory === 'all' || selectedCategory === 'fixtures') {
      searchResults.fixtures.forEach((f) => list.push({ type: 'fixture', id: f.id, data: f }));
    }

    return list;
  }, [searchResults, selectedCategory]);

  // Execute navigation item selection
  const handleSelectItem = useCallback((item: NavigableItem) => {
    if (query.trim().length >= 2) {
      addRecentSearch(query.trim());
    }

    onClose();
    switch (item.type) {
      case 'team':
        onSelectTeam(item.data.id);
        break;
      case 'player':
        onSelectPlayer(item.data.id);
        break;
      case 'competition':
        onSelectCompetition(item.data.id);
        break;
      case 'fixture':
        onSelectFixture(item.data);
        break;
    }
  }, [query, addRecentSearch, onClose, onSelectTeam, onSelectPlayer, onSelectCompetition, onSelectFixture]);

  // Keyboard navigation listener (ArrowDown, ArrowUp, Enter, Escape)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (flatNavList.length === 0) return -1;
          const next = prev + 1 >= flatNavList.length ? 0 : prev + 1;
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prev) => {
          if (flatNavList.length === 0) return -1;
          const next = prev - 1 < 0 ? flatNavList.length - 1 : prev - 1;
          return next;
        });
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < flatNavList.length) {
          e.preventDefault();
          handleSelectItem(flatNavList[highlightedIndex]);
        } else if (query.trim().length > 0 && flatNavList.length > 0) {
          e.preventDefault();
          handleSelectItem(flatNavList[0]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatNavList, highlightedIndex, handleSelectItem, onClose, query]);

  // Scroll active item into view
  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [highlightedIndex]);

  const totalResultsCount =
    searchResults.teams.length +
    searchResults.players.length +
    searchResults.competitions.length +
    searchResults.fixtures.length;

  const handleRecentClick = (term: string) => {
    setQuery(term);
    addRecentSearch(term);
    performSearch(term, selectedCategory);
  };

  const handleClearQuery = () => {
    setQuery('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-2.5 sm:p-4 md:p-8 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Global Football Search"
    >
      <div
        className="w-full max-w-3xl bg-slate-950 border border-white/15 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden my-3 sm:my-6 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Search Bar Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 bg-slate-900/90 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2.5 sm:gap-3 bg-black/40 border border-white/15 focus-within:border-[var(--primary-color)] rounded-xl sm:rounded-2xl px-3.5 py-2.5 transition-colors">
            <i className="fa-solid fa-magnifying-glass text-[var(--primary-color)] text-sm sm:text-base flex-shrink-0"></i>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clubs, players, tournaments, or matches..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-white placeholder-slate-500 focus:outline-none min-w-0"
              aria-label="Search term"
            />
            {loading && (
              <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
            )}
            {query && (
              <button
                onClick={handleClearQuery}
                aria-label="Clear search input"
                className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0"
              >
                <span>Clear</span>
                <i className="fa-solid fa-xmark text-[10px]"></i>
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close search"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>
          </div>

          {/* Category Filter Pills & Keyboard Hint */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pt-0.5">
            <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
              {(
                [
                  { id: 'all', label: 'All', icon: 'fa-globe', count: totalResultsCount },
                  { id: 'teams', label: 'Clubs', icon: 'fa-shield-halved', count: searchResults.teams.length },
                  { id: 'players', label: 'Players', icon: 'fa-user-ninja', count: searchResults.players.length },
                  { id: 'competitions', label: 'Leagues', icon: 'fa-trophy', count: searchResults.competitions.length },
                  { id: 'fixtures', label: 'Matches', icon: 'fa-futbol', count: searchResults.fixtures.length }
                ] as const
              ).map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                      isActive
                        ? 'bg-[var(--primary-color)] text-black font-bold shadow-md shadow-[var(--primary-color)]/20'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <i className={`fa-solid ${cat.icon} text-[10px]`}></i>
                    <span>{cat.label}</span>
                    {query.trim() && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20 text-black font-mono' : 'bg-white/10 text-slate-400'}`}>
                        {cat.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Desktop Keyboard hint */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-500 whitespace-nowrap flex-shrink-0">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">↑↓</span>
              <span>to navigate</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 ml-1">↵</span>
              <span>to select</span>
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 ml-1">esc</span>
              <span>close</span>
            </div>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div ref={listContainerRef} className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-mono flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <i className="fa-solid fa-triangle-exclamation text-red-400 text-sm"></i>
                <span className="truncate">{error}</span>
              </div>
              <button
                onClick={() => performSearch(query, selectedCategory)}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-mono font-bold transition-colors cursor-pointer flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {/* When Query is Empty: Show Recent Searches & Favorite Shortcuts */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-2">
                      <i className="fa-solid fa-clock-rotate-left text-slate-400"></i>
                      Recent Searches
                    </span>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[10px] text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        className="group flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-xs font-mono text-slate-300 hover:text-white cursor-pointer min-h-[38px]"
                      >
                        <span onClick={() => handleRecentClick(term)} className="truncate max-w-[180px]">
                          {term}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentSearch(term);
                          }}
                          aria-label={`Remove recent search ${term}`}
                          className="w-5 h-5 rounded-md hover:bg-white/20 flex items-center justify-center text-slate-500 hover:text-slate-200 transition-colors"
                        >
                          <i className="fa-solid fa-xmark text-[10px]"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Favourites Jump Bar */}
              {(favouriteTeamIds.length > 0 || favouriteLeagueIds.length > 0) && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <i className="fa-solid fa-star text-amber-400"></i>
                    Your Pinned Favourites
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {favouriteTeamIds.slice(0, 6).map((tid) => {
                      const found = searchResults.teams.find((t) => t.id === tid);
                      const name = found ? found.name : tid.toUpperCase();
                      return (
                        <button
                          key={tid}
                          onClick={() => {
                            onClose();
                            onSelectTeam(tid);
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-left transition-colors cursor-pointer min-h-[44px]"
                        >
                          {found?.logoUrl ? (
                            <img src={found.logoUrl} alt="" className="w-5 h-5 object-contain flex-shrink-0" />
                          ) : (
                            <i className="fa-solid fa-shield text-amber-400 text-xs"></i>
                          )}
                          <span className="text-xs font-display font-bold text-white truncate">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Discovery Suggestions */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-fire text-orange-400"></i>
                  Trending Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Erling Haaland',
                    'Manchester City',
                    'Arsenal',
                    'Real Madrid',
                    'Champions League',
                    'Kylian Mbappé',
                    'La Liga',
                    'Bukayo Saka'
                  ].map((sug) => (
                    <button
                      key={sug}
                      onClick={() => handleRecentClick(sug)}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-[var(--primary-color)] transition-colors cursor-pointer min-h-[38px] flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-arrow-trend-up text-[10px] text-slate-500"></i>
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results Sections */}
          {/* 1. Clubs / Teams */}
          {(selectedCategory === 'all' || selectedCategory === 'teams') && searchResults.teams.length > 0 && (
            <section aria-labelledby="search-clubs-heading" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 id="search-clubs-heading" className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-shield-halved text-[var(--primary-color)]"></i>
                  <span>Clubs ({searchResults.teams.length})</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Tap star to pin</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.teams.map((team) => {
                  const globalIdx = flatNavList.findIndex((item) => item.type === 'team' && item.id === team.id);
                  const isHighlighted = highlightedIndex === globalIdx;
                  const isFav = isFavouriteTeam(team.id);

                  return (
                    <div
                      key={team.id}
                      ref={isHighlighted ? (el) => { activeItemRef.current = el; } : null}
                      onClick={() => handleSelectItem({ type: 'team', id: team.id, data: team })}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer min-h-[48px] group ${
                        isHighlighted
                          ? 'bg-[var(--primary-color)]/15 border-[var(--primary-color)] shadow-md ring-1 ring-[var(--primary-color)]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 p-1">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <i className="fa-solid fa-shield text-slate-500 text-xs"></i>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-bold text-white truncate group-hover:text-[var(--primary-color)] transition-colors">
                            {team.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {team.country || 'Global'} {team.founded ? `· Est. ${team.founded}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Favourite Star Toggle */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavouriteTeam(team.id);
                          }}
                          aria-label={isFav ? `Unpin ${team.name}` : `Pin ${team.name} to favourites`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            isFav ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10' : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
                          }`}
                        >
                          <i className={`fa-star ${isFav ? 'fa-solid' : 'fa-regular'} text-xs`}></i>
                        </button>
                        <i className="fa-solid fa-arrow-right text-[10px] text-slate-600 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 2. Players */}
          {(selectedCategory === 'all' || selectedCategory === 'players') && searchResults.players.length > 0 && (
            <section aria-labelledby="search-players-heading" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 id="search-players-heading" className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-user-ninja text-amber-400"></i>
                  <span>Players ({searchResults.players.length})</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Tap star to track</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.players.map((player) => {
                  const globalIdx = flatNavList.findIndex((item) => item.type === 'player' && item.id === player.id);
                  const isHighlighted = highlightedIndex === globalIdx;
                  const isFav = isFavouritePlayer(player.id);

                  return (
                    <div
                      key={player.id}
                      ref={isHighlighted ? (el) => { activeItemRef.current = el; } : null}
                      onClick={() => handleSelectItem({ type: 'player', id: player.id, data: player })}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer min-h-[48px] group ${
                        isHighlighted
                          ? 'bg-amber-400/15 border-amber-400 shadow-md ring-1 ring-amber-400'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {player.photoUrl ? (
                          <img src={player.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover border border-white/15 flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono font-bold text-amber-400 flex items-center justify-center flex-shrink-0">
                            {player.number || '★'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                            {player.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {player.position} · {player.teamName || player.nationality || 'Footballer'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {player.rating && (
                          <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                            ★ {player.rating}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavouritePlayer(player.id);
                          }}
                          aria-label={isFav ? `Unpin ${player.name}` : `Pin ${player.name} to favourites`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            isFav ? 'text-amber-400 hover:text-amber-300 bg-amber-400/10' : 'text-slate-500 hover:text-amber-400 hover:bg-white/5'
                          }`}
                        >
                          <i className={`fa-star ${isFav ? 'fa-solid' : 'fa-regular'} text-xs`}></i>
                        </button>
                        <i className="fa-solid fa-arrow-right text-[10px] text-slate-600 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 3. Competitions / Tournaments */}
          {(selectedCategory === 'all' || selectedCategory === 'competitions') && searchResults.competitions.length > 0 && (
            <section aria-labelledby="search-tournaments-heading" className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 id="search-tournaments-heading" className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <i className="fa-solid fa-trophy text-blue-400"></i>
                  <span>Leagues & Competitions ({searchResults.competitions.length})</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-500">Tap star to track</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {searchResults.competitions.map((comp) => {
                  const globalIdx = flatNavList.findIndex((item) => item.type === 'competition' && item.id === comp.id);
                  const isHighlighted = highlightedIndex === globalIdx;
                  const isFav = isFavouriteLeague(comp.id);

                  return (
                    <div
                      key={comp.id}
                      ref={isHighlighted ? (el) => { activeItemRef.current = el; } : null}
                      onClick={() => handleSelectItem({ type: 'competition', id: comp.id, data: comp })}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer min-h-[48px] group ${
                        isHighlighted
                          ? 'bg-blue-500/15 border-blue-400 shadow-md ring-1 ring-blue-400'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center flex-shrink-0 p-1">
                          {comp.logoUrl ? (
                            <img src={comp.logoUrl} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <i className="fa-solid fa-trophy text-blue-400 text-xs"></i>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                            {comp.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {comp.country} · {comp.season || '2024/25'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavouriteLeague(comp.id);
                          }}
                          aria-label={isFav ? `Unpin ${comp.name}` : `Pin ${comp.name} to favourites`}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            isFav ? 'text-blue-400 hover:text-blue-300 bg-blue-400/10' : 'text-slate-500 hover:text-blue-400 hover:bg-white/5'
                          }`}
                        >
                          <i className={`fa-star ${isFav ? 'fa-solid' : 'fa-regular'} text-xs`}></i>
                        </button>
                        <i className="fa-solid fa-arrow-right text-[10px] text-slate-600 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 4. Fixtures / Matches */}
          {(selectedCategory === 'all' || selectedCategory === 'fixtures') && searchResults.fixtures.length > 0 && (
            <section aria-labelledby="search-fixtures-heading" className="space-y-2.5">
              <h4 id="search-fixtures-heading" className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <i className="fa-solid fa-futbol text-emerald-400"></i>
                <span>Fixtures & Results ({searchResults.fixtures.length})</span>
              </h4>

              <div className="space-y-2">
                {searchResults.fixtures.map((fixture) => {
                  const globalIdx = flatNavList.findIndex((item) => item.type === 'fixture' && item.id === fixture.id);
                  const isHighlighted = highlightedIndex === globalIdx;
                  const isLive = fixture.isLive || fixture.status === 'LIVE' || fixture.status === 'HT';

                  return (
                    <div
                      key={fixture.id}
                      ref={isHighlighted ? (el) => { activeItemRef.current = el; } : null}
                      onClick={() => handleSelectItem({ type: 'fixture', id: fixture.id, data: fixture })}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer min-h-[50px] group ${
                        isHighlighted
                          ? 'bg-emerald-500/15 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {fixture.homeTeam?.logoUrl ? (
                            <img src={fixture.homeTeam.logoUrl} alt="" className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="w-5 h-5 rounded bg-white/10 text-[9px] font-mono flex items-center justify-center">H</span>
                          )}
                          <span className="text-slate-500 text-xs">vs</span>
                          {fixture.awayTeam?.logoUrl ? (
                            <img src={fixture.awayTeam.logoUrl} alt="" className="w-5 h-5 object-contain" />
                          ) : (
                            <span className="w-5 h-5 rounded bg-white/10 text-[9px] font-mono flex items-center justify-center">A</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-display font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                            {fixture.homeTeam?.name} vs {fixture.awayTeam?.name}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 truncate">
                            {fixture.competition?.name} · {fixture.round || 'Regular'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 flex-shrink-0">
                        {isLive ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                            {fixture.score?.home ?? 0} - {fixture.score?.away ?? 0} LIVE
                          </span>
                        ) : fixture.status === 'FT' ? (
                          <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px] font-mono font-bold">
                            {fixture.score?.home ?? 0} - {fixture.score?.away ?? 0} FT
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[var(--primary-color)] font-semibold">
                            {new Date(fixture.startingAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        <i className="fa-solid fa-chevron-right text-[10px] text-slate-600 group-hover:text-white transition-colors"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Empty Search Results State */}
          {query.trim() && !loading && totalResultsCount === 0 && (
            <div className="py-12 px-4 text-center space-y-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-500 text-xl">
                <i className="fa-solid fa-magnifying-glass"></i>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-display font-bold text-white">
                  No football records found for "{query}"
                </h4>
                <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
                  Try checking the spelling, or search by club shortcode (e.g. MCI, RMA), player surname, or tournament.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleRecentClick('Haaland')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                >
                  Search "Haaland"
                </button>
                <button
                  onClick={() => handleRecentClick('Real Madrid')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                >
                  Search "Real Madrid"
                </button>
                <button
                  onClick={() => handleRecentClick('Premier League')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-slate-200 transition-colors cursor-pointer"
                >
                  Search "Premier League"
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
