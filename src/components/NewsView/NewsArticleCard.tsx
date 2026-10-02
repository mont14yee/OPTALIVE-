import React from 'react';
import { NewsArticle } from '../../types/football';
import { formatFixtureDate } from '../../utils/footballDates';
import { sanitizeExternalUrl } from '../../utils/sanitizeUrl';

interface NewsArticleCardProps {
  article: NewsArticle;
  onSelect: (article: NewsArticle) => void;
  onFilterByLeague?: (leagueId: string) => void;
  onFilterByTeam?: (team: string) => void;
  onFilterByPlayer?: (player: string) => void;
  onOpenMatchCenter?: (fixtureId: string) => void;
}

export const NewsArticleCard: React.FC<NewsArticleCardProps> = ({
  article,
  onSelect,
  onFilterByLeague,
  onFilterByTeam,
  onFilterByPlayer,
  onOpenMatchCenter
}) => {
  const publishedFormatted = formatFixtureDate(article.publishedAt, {
    includeDayOfWeek: true,
    includeYear: false
  });

  return (
    <article
      onClick={() => onSelect(article)}
      className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-[var(--primary-color)]/50 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between cursor-pointer"
    >
      {/* Top Editorial Photography Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/60">
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30 pointer-events-none" />

        {/* Category & Verified Attribution Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md font-mono text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-wider border border-white/10 shadow-sm">
            {article.category}
          </span>
          <span className="px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md font-mono text-[9px] font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-[8px]"></i>
            VERIFIED
          </span>
        </div>

        {/* Source Attribution and Timestamp on Image Bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-300">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-white font-bold">
            {article.source}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/10 text-slate-300">
            {publishedFormatted}
          </span>
        </div>
      </div>

      {/* Main Editorial Card Content */}
      <div className="p-5 md:p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Competition Strip */}
          {article.competition && (
            <div className="flex items-center gap-2">
              {article.competition.logoUrl && (
                <img
                  src={article.competition.logoUrl}
                  alt=""
                  className="w-3.5 h-3.5 object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                {article.competition.name}
              </span>
            </div>
          )}

          {/* Headline */}
          <h3 className="font-display font-black uppercase text-base sm:text-lg text-white group-hover:text-[var(--primary-color)] transition-colors leading-snug">
            {article.title}
          </h3>

          {/* Short Summary */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* Connected Entities: Related Team, Fixture, Player */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {article.competition && onFilterByLeague && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFilterByLeague(article.competition!.id);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                title={`Filter by ${article.competition.name}`}
              >
                🏆 {article.competition.shortName || article.competition.name}
              </button>
            )}

            {article.relatedTeam && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFilterByTeam) onFilterByTeam(article.relatedTeam!);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                title={`Filter by ${article.relatedTeam}`}
              >
                🛡️ {article.relatedTeam}
              </button>
            )}

            {article.relatedPlayer && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onFilterByPlayer) onFilterByPlayer(article.relatedPlayer!);
                }}
                className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                title={`Filter by ${article.relatedPlayer}`}
              >
                ⭐ {article.relatedPlayer}
              </button>
            )}

            {article.relatedFixtureId && onOpenMatchCenter && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMatchCenter(article.relatedFixtureId!);
                }}
                className="px-2 py-0.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-[10px] font-mono font-bold text-blue-300 hover:text-white transition-colors flex items-center gap-1 ml-auto"
                title="View Match Center telemetry"
              >
                <i className="fa-solid fa-tv text-[9px]"></i>
                <span>Match Center</span>
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 text-xs font-mono">
            <span className="text-[var(--primary-color)] font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Read Analysis <i className="fa-solid fa-arrow-right text-[10px]"></i>
            </span>

            <a
              href={sanitizeExternalUrl(article.url)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1 text-[10px]"
              title={`Open ${article.source} in new tab`}
            >
              <span>{article.source}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
