import React from 'react';
import { ApiStatus } from '../types/football';

interface HeaderProps {
  apiStatus: ApiStatus | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  selectedDate: string;
  onDateChange: (date: string) => void;
  onOpenSearch: () => void;
  onOpenFavourites: () => void;
  onOpenSettings: () => void;
  favouritesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  onRefresh,
  isRefreshing,
  selectedDate,
  onDateChange,
  onOpenSearch,
  onOpenFavourites,
  onOpenSettings,
  favouritesCount = 0
}) => {
  const dates = [
    { label: 'YESTERDAY', value: 'yesterday' },
    { label: 'TODAY', value: 'today' },
    { label: 'TOMORROW', value: 'tomorrow' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-black border border-[var(--primary-color)]/50 flex items-center justify-center text-[var(--primary-color)] font-display font-black text-lg sm:text-2xl shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)] flex-shrink-0">
            O
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-black text-lg sm:text-2xl tracking-tighter text-white uppercase truncate">
                OPTA<span className="text-[var(--primary-color)]">LIVE</span>
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/30 text-[9px] font-mono font-bold text-[var(--primary-color)] uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)]"></span>
                v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Quick Date Switcher (hidden on mobile, visible from tablet up) */}
        <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs">
          {dates.map((d) => (
            <button
              key={d.value}
              onClick={() => onDateChange(d.value)}
              className={`px-3 py-1.5 rounded-lg font-mono font-bold text-[10px] tracking-wider transition-colors cursor-pointer ${
                selectedDate === d.value
                  ? 'bg-[var(--primary-color)] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Secondary Actions: Search, Favourites, Settings, Refresh */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* 1. SEARCH ACTION */}
          <button
            onClick={onOpenSearch}
            aria-label="Search football clubs, players, matches"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
            title="Search (Clubs, Players, Leagues, Fixtures)"
          >
            <i className="fa-solid fa-magnifying-glass text-xs sm:text-sm"></i>
          </button>

          {/* 2. FAVOURITES ACTION */}
          <button
            onClick={onOpenFavourites}
            aria-label="View favourite clubs and pinned matches"
            className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
            title="Favourites"
          >
            <i className="fa-solid fa-star text-xs sm:text-sm text-amber-400"></i>
            {favouritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black flex items-center justify-center">
                {favouritesCount}
              </span>
            )}
          </button>

          {/* 3. SETTINGS ACTION */}
          <button
            onClick={onOpenSettings}
            aria-label="Open Settings"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Settings & Visual Preferences"
          >
            <i className="fa-solid fa-sliders text-xs sm:text-sm"></i>
          </button>

          {/* 4. REFRESH CONTROL */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Refresh match data"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-white/20 flex items-center justify-center text-slate-300 hover:text-[var(--primary-color)] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh match telemetry"
          >
            <i className={`fa-solid fa-arrows-rotate text-xs sm:text-sm ${isRefreshing ? 'fa-spin text-[var(--primary-color)]' : ''}`}></i>
          </button>
        </div>
      </div>
    </header>
  );
};
