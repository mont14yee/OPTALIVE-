import React from 'react';

export const ScheduleSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-slate-900/40 border border-white/5 rounded-2xl md:rounded-3xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          {/* Left info */}
          <div className="flex items-center gap-3 md:w-1/4">
            <div className="w-8 h-8 rounded-xl bg-white/10" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 bg-white/10 rounded w-28" />
              <div className="h-2.5 bg-white/5 rounded w-20" />
            </div>
          </div>

          {/* Center Teams & Score */}
          <div className="flex-1 flex items-center justify-between md:justify-center gap-4 md:gap-8">
            {/* Home */}
            <div className="flex items-center gap-2.5 flex-1 justify-end">
              <div className="h-4 bg-white/10 rounded w-24 hidden sm:block" />
              <div className="w-9 h-9 rounded-full bg-white/10" />
            </div>

            {/* Score/Time Badge */}
            <div className="w-20 h-10 rounded-xl bg-white/10 flex items-center justify-center" />

            {/* Away */}
            <div className="flex items-center gap-2.5 flex-1 justify-start">
              <div className="w-9 h-9 rounded-full bg-white/10" />
              <div className="h-4 bg-white/10 rounded w-24 hidden sm:block" />
            </div>
          </div>

          {/* Right Venue/Status */}
          <div className="flex items-center justify-between md:justify-end gap-3 md:w-1/4">
            <div className="space-y-1">
              <div className="h-2.5 bg-white/5 rounded w-32 hidden md:block" />
              <div className="h-3 bg-white/10 rounded w-16" />
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
