import React from 'react';
import { HighlightItem } from '../../types/football';
import { sanitizeExternalUrl } from '../../utils/sanitizeUrl';

interface HighlightCardProps {
  highlight: HighlightItem;
  onOpenMatchCenter?: (fixtureId: string) => void;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
  highlight,
  onOpenMatchCenter
}) => {
  return (
    <article className="group bg-slate-900/60 hover:bg-slate-900/90 border border-white/10 hover:border-amber-400/50 rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col justify-between">
      {/* Thumbnail Banner with duration and verified provider */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/80">
        <img
          src={highlight.thumbnail}
          alt={highlight.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/40 pointer-events-none" />

        {/* Top Badges: Competition & Official Source Verification */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md font-mono text-[10px] font-bold text-amber-300 uppercase tracking-wider border border-amber-400/30 shadow-sm flex items-center gap-1.5">
            <i className="fa-solid fa-clapperboard text-xs"></i>
            {highlight.competition}
          </span>

          <span className="px-2 py-0.5 rounded-lg bg-emerald-950/80 backdrop-blur-md font-mono text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <i className="fa-solid fa-circle-check text-[8px]"></i>
            OFFICIAL BROADCASTER
          </span>
        </div>

        {/* Duration & Key Moment Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10 font-bold text-white flex items-center gap-1">
            <i className="fa-regular fa-clock text-[10px]"></i>
            {highlight.duration}
          </span>

          {highlight.score && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-black font-display font-black text-xs shadow-md">
              {highlight.score}
            </span>
          )}
        </div>
      </div>

      {/* Main Highlights Content */}
      <div className="p-5 md:p-6 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Broadcaster Provider Tag */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Provider:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <i className="fa-solid fa-satellite-dish text-amber-400 text-xs"></i>
              {highlight.provider}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-black uppercase text-base sm:text-lg text-white group-hover:text-amber-300 transition-colors leading-snug">
            {highlight.title}
          </h3>

          {/* Description */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans line-clamp-2">
            {highlight.matchDescription}
          </p>

          {/* Key moment highlight bullet */}
          {highlight.keyMoment && (
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300 flex items-start gap-2">
              <i className="fa-solid fa-futbol text-amber-400 text-xs mt-0.5 flex-shrink-0"></i>
              <span className="line-clamp-2">{highlight.keyMoment}</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Related Fixture Match Center button */}
          {highlight.fixtureId && onOpenMatchCenter && (
            <button
              type="button"
              onClick={() => onOpenMatchCenter(highlight.fixtureId!)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-tv text-[10px] text-blue-400"></i>
              <span>Match Center</span>
            </button>
          )}

          {/* Video watch or availability status */}
          {highlight.videoAvailable && highlight.videoUrl ? (
            <a
              href={sanitizeExternalUrl(highlight.videoUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-display font-black uppercase text-xs tracking-wider transition-all inline-flex items-center gap-1.5 ml-auto shadow-md"
            >
              <span>Watch on {highlight.provider.split(' ')[0]}</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-xs font-mono ml-auto">
              Clip Pending Broadcaster Upload
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
