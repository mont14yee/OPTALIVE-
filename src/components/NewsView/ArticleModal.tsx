import React from 'react';
import { NewsArticle, Fixture } from '../../types/football';
import { formatFixtureDate } from '../../utils/footballDates';
import { sanitizeExternalUrl } from '../../utils/sanitizeUrl';

interface ArticleModalProps {
  article: NewsArticle;
  onClose: () => void;
  onOpenMatchCenter?: (fixtureId: string) => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onOpenMatchCenter
}) => {
  const publishedFormatted = formatFixtureDate(article.publishedAt, {
    includeDayOfWeek: true,
    includeYear: true
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-slate-950 border border-white/15 rounded-3xl md:rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-slate-900/90 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/40 text-[var(--primary-color)] font-mono text-[10px] font-bold uppercase tracking-wider">
              {article.category.toUpperCase()}
            </span>
            <span className="font-mono text-xs text-slate-400">
              Source: <strong className="text-white">{article.source}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Scrollable Article Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Article Image Banner */}
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-black/60 shadow-lg">
            <img
              src={article.imageUrl}
              alt={article.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />
            
            {/* Source Stamp Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-mono text-slate-300">
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white font-semibold">
                Attribution: {article.source}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-slate-300">
                {publishedFormatted}
              </span>
            </div>
          </div>

          {/* Headline & Metadata */}
          <div className="space-y-3">
            <h2 className="font-display font-black text-xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
              {article.title}
            </h2>

            {/* Entity Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {article.competition && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                  {article.competition.logoUrl && (
                    <img
                      src={article.competition.logoUrl}
                      alt=""
                      className="w-3.5 h-3.5 object-contain"
                    />
                  )}
                  <span>{article.competition.shortName || article.competition.name}</span>
                </div>
              )}

              {article.relatedTeam && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                  <i className="fa-solid fa-shield text-[var(--primary-color)] text-xs"></i>
                  <span>{article.relatedTeam}</span>
                </div>
              )}

              {article.relatedPlayer && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-200">
                  <i className="fa-solid fa-user text-sky-400 text-xs"></i>
                  <span>{article.relatedPlayer}</span>
                </div>
              )}

              {article.readTimeMinutes && (
                <span className="text-xs font-mono text-slate-400 ml-auto">
                  <i className="fa-regular fa-clock text-[10px] mr-1"></i>
                  {article.readTimeMinutes} min read
                </span>
              )}
            </div>
          </div>

          {/* Lead Summary Callout */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border-l-4 border-[var(--primary-color)] text-slate-200 text-sm sm:text-base leading-relaxed font-sans italic">
            "{article.summary}"
          </div>

          {/* Key Takeaways */}
          {article.keyTakeaways && article.keyTakeaways.length > 0 && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--primary-color)]">
                <i className="fa-solid fa-bolt-lightning text-xs"></i>
                Key Match Intel & Insights
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                {article.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] mt-1.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Body Paragraphs */}
          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed font-sans">
            {article.contentParagraphs && article.contentParagraphs.length > 0 ? (
              article.contentParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))
            ) : (
              <p>{article.summary}</p>
            )}
          </div>

          {/* Related Fixture Link Button */}
          {article.relatedFixtureId && onOpenMatchCenter && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <i className="fa-solid fa-tv text-blue-400 text-lg"></i>
                <div>
                  <h4 className="font-display font-bold uppercase text-white text-sm">
                    Related Fixture Telemetry Available
                  </h4>
                  <p className="text-xs font-mono text-slate-400">
                    Live lineup, formations, momentum, and statistical breakdown
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMatchCenter(article.relatedFixtureId!);
                }}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-display font-bold uppercase text-xs tracking-wider transition-colors cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5"
              >
                <span>Open Match Center</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-white/10 bg-slate-900/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <i className="fa-solid fa-shield-check text-emerald-400"></i>
            <span>Verified Source Attribution: {article.source}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-xs transition-colors"
            >
              Close
            </button>

            <a
              href={sanitizeExternalUrl(article.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[var(--primary-color)] text-black font-display font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all inline-flex items-center gap-1.5 shadow-md"
            >
              <span>Read on {article.source}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
