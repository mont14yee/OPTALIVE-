import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsArticle, HighlightItem, NewsSection, Competition } from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { NewsArticleCard } from './NewsArticleCard';
import { HighlightCard } from './HighlightCard';
import { ArticleModal } from './ArticleModal';
import { NewsSkeleton } from './NewsSkeleton';

export type ActiveNewsTab = 'latest' | 'match_news' | 'transfer_news' | 'league_news' | 'team_news' | 'highlights';

interface NewsViewProps {
  competitions?: Competition[];
  onOpenMatchCenter?: (fixtureId: string) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  competitions = [],
  onOpenMatchCenter
}) => {
  // Active Section Tab
  const [activeSection, setActiveSection] = useState<ActiveNewsTab>('latest');

  // Articles & Highlights Data
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected Article for dedicated Reader Modal
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Cross-entity Filters: League, Team, Player, Search
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Last update timestamp & second counter
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Ticker for updated seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSynced.getTime()) / 1000);
      setSecondsAgo(Math.max(0, elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSynced]);

  // Fetch all news & highlights
  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setIsUnavailable(false);
    setErrorMessage(null);

    try {
      const [newsData, highlightsData] = await Promise.all([
        footballClient.getNews(),
        footballClient.getHighlights()
      ]);
      setArticles(newsData);
      setHighlights(highlightsData);
      setLastSynced(new Date());
      setSecondsAgo(0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'News wire temporarily unreachable';
      console.warn('News wire sync error:', msg);
      setIsUnavailable(true);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Available unique teams from articles for entity filter
  const availableTeams = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.relatedTeam) set.add(a.relatedTeam);
    });
    highlights.forEach((h) => {
      if (h.relatedTeams?.home) set.add(h.relatedTeams.home);
      if (h.relatedTeams?.away) set.add(h.relatedTeams.away);
    });
    return Array.from(set).sort();
  }, [articles, highlights]);

  // Available unique players from articles for entity filter
  const availablePlayers = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.relatedPlayer) set.add(a.relatedPlayer);
    });
    return Array.from(set).sort();
  }, [articles]);

  // Filter Articles based on active section and entity filters
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // 1. Section Filter
      if (activeSection === 'latest') {
        // 'latest' includes all articles
      } else if (activeSection === 'match_news') {
        if (article.section !== 'match_news' && article.category !== 'match' && article.category !== 'tactical') {
          return false;
        }
      } else if (activeSection === 'transfer_news') {
        if (article.section !== 'transfer_news' && article.category !== 'transfer') {
          return false;
        }
      } else if (activeSection === 'league_news') {
        if (article.section !== 'league_news' && article.category !== 'league') {
          return false;
        }
      } else if (activeSection === 'team_news') {
        if (article.section !== 'team_news' && article.category !== 'team' && article.category !== 'injury') {
          return false;
        }
      }

      // 2. League Filter
      if (selectedLeagueId !== 'all') {
        const compId = article.competition?.id?.toLowerCase();
        if (compId !== selectedLeagueId.toLowerCase()) return false;
      }

      // 3. Team Filter
      if (selectedTeam !== 'all') {
        const teamName = (article.relatedTeam || '').toLowerCase();
        const summary = article.summary.toLowerCase();
        const title = article.title.toLowerCase();
        const target = selectedTeam.toLowerCase();
        if (!teamName.includes(target) && !summary.includes(target) && !title.includes(target)) {
          return false;
        }
      }

      // 4. Player Filter
      if (selectedPlayer !== 'all') {
        const playerName = (article.relatedPlayer || '').toLowerCase();
        const summary = article.summary.toLowerCase();
        const title = article.title.toLowerCase();
        const target = selectedPlayer.toLowerCase();
        if (!playerName.includes(target) && !summary.includes(target) && !title.includes(target)) {
          return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = article.title.toLowerCase();
        const summary = article.summary.toLowerCase();
        const source = article.source.toLowerCase();
        const team = (article.relatedTeam || '').toLowerCase();
        const player = (article.relatedPlayer || '').toLowerCase();
        return title.includes(q) || summary.includes(q) || source.includes(q) || team.includes(q) || player.includes(q);
      }

      return true;
    });
  }, [articles, activeSection, selectedLeagueId, selectedTeam, selectedPlayer, searchQuery]);

  // Filter Highlights based on entity filters
  const filteredHighlights = useMemo(() => {
    return highlights.filter((h) => {
      // League Filter
      if (selectedLeagueId !== 'all') {
        const cid = (h.competitionId || '').toLowerCase();
        const cname = h.competition.toLowerCase();
        if (cid !== selectedLeagueId.toLowerCase() && !cname.includes(selectedLeagueId.toLowerCase())) {
          return false;
        }
      }

      // Team Filter
      if (selectedTeam !== 'all') {
        const home = (h.relatedTeams?.home || '').toLowerCase();
        const away = (h.relatedTeams?.away || '').toLowerCase();
        const desc = h.matchDescription.toLowerCase();
        const title = h.title.toLowerCase();
        const target = selectedTeam.toLowerCase();
        if (!home.includes(target) && !away.includes(target) && !desc.includes(target) && !title.includes(target)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = h.title.toLowerCase();
        const desc = h.matchDescription.toLowerCase();
        const provider = h.provider.toLowerCase();
        const comp = h.competition.toLowerCase();
        return title.includes(q) || desc.includes(q) || provider.includes(q) || comp.includes(q);
      }

      return true;
    });
  }, [highlights, selectedLeagueId, selectedTeam, searchQuery]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedLeagueId('all');
    setSelectedTeam('all');
    setSelectedPlayer('all');
    setSearchQuery('');
  };

  const renderUpdatedLabel = () => {
    if (secondsAgo <= 1) return 'Synced just now';
    if (secondsAgo < 60) return `Synced ${secondsAgo}s ago`;
    return `Synced ${Math.floor(secondsAgo / 60)}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* 1. News Control Header */}
      <div className="bg-slate-900/60 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-5">
        {/* Title, Attribution Notice & Refresh */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/30 flex items-center justify-center text-[var(--primary-color)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              <i className="fa-solid fa-newspaper text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black uppercase text-lg md:text-xl text-white tracking-wider">
                  Football News Wire
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-500/30">
                  VERIFIED SOURCES
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{renderUpdatedLabel()}</span>
                <span>•</span>
                <span className="text-slate-300">
                  Editorial reports with authentic source attribution
                </span>
              </p>
            </div>
          </div>

          {/* Search bar & Refresh control */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search headlines, sources, stars..."
                className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              title="Refresh news wire"
              className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate text-xs ${isRefreshing ? 'animate-spin text-[var(--primary-color)]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* 2. Primary Sections: LATEST | MATCH NEWS | TRANSFER NEWS | LEAGUE NEWS | TEAM NEWS | HIGHLIGHTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-white/5">
          {[
            { id: 'latest', label: 'LATEST', icon: 'fa-solid fa-bolt', count: articles.length },
            { id: 'match_news', label: 'MATCH NEWS', icon: 'fa-solid fa-futbol', count: articles.filter((a) => a.section === 'match_news' || a.category === 'match' || a.category === 'tactical').length },
            { id: 'transfer_news', label: 'TRANSFER NEWS', icon: 'fa-solid fa-arrow-right-arrow-left', count: articles.filter((a) => a.section === 'transfer_news' || a.category === 'transfer').length },
            { id: 'league_news', label: 'LEAGUE NEWS', icon: 'fa-solid fa-trophy', count: articles.filter((a) => a.section === 'league_news' || a.category === 'league').length },
            { id: 'team_news', label: 'TEAM NEWS', icon: 'fa-solid fa-shield-halved', count: articles.filter((a) => a.section === 'team_news' || a.category === 'team' || a.category === 'injury').length },
            { id: 'highlights', label: 'HIGHLIGHTS', icon: 'fa-solid fa-clapperboard', count: highlights.length, isSpecial: true }
          ].map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveSection(sec.id as ActiveNewsTab)}
                className={`py-2.5 px-3 rounded-xl font-display font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-between gap-1.5 border cursor-pointer ${
                  isActive
                    ? sec.isSpecial
                      ? 'bg-amber-400 text-black border-amber-400 font-black shadow-[0_0_15px_rgba(251,191,36,0.35)]'
                      : 'bg-[var(--primary-color)] text-black border-[var(--primary-color)] font-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)]'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <i className={`${sec.icon} text-xs`} />
                  <span className="truncate">{sec.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black/30 text-black font-black' : 'bg-white/10 text-slate-400'
                  }`}
                >
                  {sec.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Entity Filter Bar: Connected to Leagues, Teams, and Players */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/5 text-xs">
          {/* League Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <i className="fa-solid fa-trophy text-[var(--primary-color)] text-[10px]"></i>
              Connected League
            </label>
            <select
              value={selectedLeagueId}
              onChange={(e) => setSelectedLeagueId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Leagues</option>
              <option value="epl">Premier League</option>
              <option value="ucl">UEFA Champions League</option>
              <option value="laliga">La Liga EA Sports</option>
              <option value="seriea">Serie A</option>
              <option value="bundesliga">Bundesliga</option>
              <option value="ligue1">Ligue 1</option>
              <option value="worldcup">World Cup Qualifiers</option>
            </select>
          </div>

          {/* Team Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <i className="fa-solid fa-shield text-[var(--primary-color)] text-[10px]"></i>
              Connected Club
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Clubs ({availableTeams.length})</option>
              {availableTeams.map((teamName) => (
                <option key={teamName} value={teamName}>
                  {teamName}
                </option>
              ))}
            </select>
          </div>

          {/* Player Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <i className="fa-solid fa-user text-sky-400 text-[10px]"></i>
              Connected Player
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Players ({availablePlayers.length})</option>
              {availablePlayers.map((player) => (
                <option key={player} value={player}>
                  {player}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(selectedLeagueId !== 'all' || selectedTeam !== 'all' || selectedPlayer !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[10px] font-mono text-slate-400">Filtering:</span>

            {selectedLeagueId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                🏆 {selectedLeagueId.toUpperCase()}
                <button onClick={() => setSelectedLeagueId('all')} className="ml-1 hover:text-red-400">×</button>
              </span>
            )}

            {selectedTeam !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                🛡️ {selectedTeam}
                <button onClick={() => setSelectedTeam('all')} className="ml-1 hover:text-red-400">×</button>
              </span>
            )}

            {selectedPlayer !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                ⭐ {selectedPlayer}
                <button onClick={() => setSelectedPlayer('all')} className="ml-1 hover:text-red-400">×</button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-red-400">×</button>
              </span>
            )}

            <button
              onClick={handleResetFilters}
              className="text-[10px] font-mono text-[var(--primary-color)] hover:underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Unavailable State Banner */}
      {isUnavailable && (
        <div className="bg-rose-950/70 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-200 text-xs font-mono shadow-xl animate-shake">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-base"></i>
            </div>
            <div>
              <p className="font-bold text-white">News Feed Unavailable</p>
              <p className="text-rose-300 text-[11px]">{errorMessage || 'Could not connect to external reporting wire.'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => loadData(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-display font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer flex-shrink-0"
          >
            Retry Wire
          </button>
        </div>
      )}

      {/* 5. Editorial Content / Cards Area */}
      {isLoading ? (
        <NewsSkeleton />
      ) : activeSection === 'highlights' ? (
        /* HIGHLIGHTS SECTION */
        filteredHighlights.length === 0 ? (
          /* Empty Highlights State */
          <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-white/5 space-y-4 p-8 max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 mx-auto text-2xl">
              <i className="fa-solid fa-clapperboard"></i>
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black uppercase text-white text-base tracking-wider">
                No Highlights Matching Criteria
              </h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No verified official broadcast clips match "${searchQuery}".`
                  : 'No match recaps currently meet the selected filters.'}
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-amber-400 text-black font-display font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legitimacy notice */}
            <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/20 text-xs font-mono text-amber-200 flex items-center gap-2.5">
              <i className="fa-solid fa-shield-check text-amber-400 text-sm"></i>
              <span>
                <strong>Broadcaster Compliance Notice:</strong> All clips link exclusively to verified official broadcasters and tournament publishers (Sky Sports, UEFA.tv, DAZN, CBS Sports Golazo). No unauthorized video embeds.
              </span>
            </div>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHighlights.map((hl) => (
                <HighlightCard
                  key={hl.id}
                  highlight={hl}
                  onOpenMatchCenter={onOpenMatchCenter}
                />
              ))}
            </div>
          </div>
        )
      ) : (
        /* ARTICLES SECTION */
        filteredArticles.length === 0 ? (
          /* Empty Articles State */
          <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-white/5 space-y-4 p-8 max-w-lg mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto text-2xl">
              <i className="fa-regular fa-newspaper"></i>
            </div>
            <div className="space-y-1">
              <h3 className="font-display font-black uppercase text-white text-base tracking-wider">
                No Editorial Reports Found
              </h3>
              <p className="text-xs font-mono text-slate-400 leading-relaxed">
                {searchQuery
                  ? `No verified reports match "${searchQuery}".`
                  : 'There are currently no reports for this section and entity combination.'}
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[var(--primary-color)] text-black font-display font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                onSelect={(art) => setSelectedArticle(art)}
                onFilterByLeague={(lid) => setSelectedLeagueId(lid)}
                onFilterByTeam={(t) => setSelectedTeam(t)}
                onFilterByPlayer={(p) => setSelectedPlayer(p)}
                onOpenMatchCenter={onOpenMatchCenter}
              />
            ))}
          </div>
        )
      )}

      {/* 6. Dedicated In-App Article View Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onOpenMatchCenter={onOpenMatchCenter}
        />
      )}
    </div>
  );
};
