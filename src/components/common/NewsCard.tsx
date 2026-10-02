import React, { useState } from 'react';
import { NewsArticle } from '../../types/football';

interface NewsCardProps {
  article: NewsArticle;
  onClick: (article: NewsArticle) => void;
  className?: string;
}

const DEFAULT_NEWS_IMAGE = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80';

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onClick,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const image = (!imgError && article.imageUrl) ? article.imageUrl : DEFAULT_NEWS_IMAGE;

  return (
    <div
      onClick={() => onClick(article)}
      className={`group bg-slate-900/60 hover:bg-slate-900 border border-white/10 hover:border-[var(--primary-color)]/50 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 shadow-xl flex flex-col ${className}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-950">
        <img
          src={image}
          alt={article.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 font-mono text-[10px] font-bold text-[var(--primary-color)] uppercase tracking-wider">
            {article.category}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.publishedAt}</span>
          </div>

          <h3 className="font-display font-bold uppercase text-base sm:text-lg text-white group-hover:text-[var(--primary-color)] transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {article.summary}
          </p>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[var(--primary-color)]">
          <span className="font-bold">Read Analysis</span>
          <i className="fa-solid fa-arrow-right text-[10px] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};
