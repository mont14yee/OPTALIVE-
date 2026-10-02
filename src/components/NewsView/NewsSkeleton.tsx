import React from 'react';

export const NewsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl overflow-hidden p-0 flex flex-col justify-between"
        >
          {/* Image skeleton */}
          <div className="aspect-[16/9] w-full bg-white/5" />

          {/* Body skeleton */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-4 bg-white/10 rounded w-24" />
              <div className="h-4 bg-white/5 rounded w-16" />
            </div>

            <div className="space-y-2">
              <div className="h-5 bg-white/10 rounded w-4/5" />
              <div className="h-5 bg-white/10 rounded w-3/5" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 bg-white/5 rounded w-full" />
              <div className="h-3.5 bg-white/5 rounded w-5/6" />
              <div className="h-3.5 bg-white/5 rounded w-2/3" />
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="h-3 bg-white/5 rounded w-28" />
              <div className="h-4 bg-white/10 rounded w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
