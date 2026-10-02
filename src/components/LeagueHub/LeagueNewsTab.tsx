import React from 'react';
import { NewsArticle, Competition } from '../../types/football';
import { sanitizeExternalUrl } from '../../utils/sanitizeUrl';
import { NewsCard, LoadingState, EmptyState } from '../common';

interface LeagueNewsTabProps {
  news: NewsArticle[];
  competition: Competition;
  loading: boolean;
}

export const LeagueNewsTab: React.FC<LeagueNewsTabProps> = ({
  news,
  competition,
  loading
}) => {
  if (loading) {
    return <LoadingState message="Curating League News Feed..." />;
  }

  // Filter or show all news
  const relevantNews = news.filter(
    (n) =>
      n.title.toLowerCase().includes(competition.name.toLowerCase()) ||
      n.title.toLowerCase().includes(competition.shortName.toLowerCase()) ||
      n.summary.toLowerCase().includes(competition.name.toLowerCase()) ||
      n.summary.toLowerCase().includes(competition.shortName.toLowerCase())
  );

  const displayList = relevantNews.length > 0 ? relevantNews : news;

  if (displayList.length === 0) {
    return (
      <EmptyState
        icon="fa-newspaper"
        title="No News Available"
        description="No tactical articles or match reports currently found for this tournament."
      />
    );
  }

  const handleArticleClick = (article: NewsArticle) => {
    const safeUrl = sanitizeExternalUrl(article.url);
    if (safeUrl && safeUrl !== '#') {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div>
          <h3 className="font-display font-black uppercase text-white text-base md:text-lg tracking-tight">
            {competition.name} News & Tactical Intel
          </h3>
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
            Opta predictive analysis, match previews and verified tournament news
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onClick={handleArticleClick}
          />
        ))}
      </div>
    </div>
  );
};
