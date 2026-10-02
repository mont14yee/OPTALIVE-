import React from 'react';

export type MainTab = 'home' | 'live' | 'matches' | 'leagues' | 'news';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  liveMatchCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  liveMatchCount = 0
}) => {
  const tabs = [
    { id: 'home', label: 'HOME', icon: 'fa-house' },
    { id: 'live', label: 'LIVE', icon: 'fa-satellite-dish', badge: liveMatchCount > 0 ? liveMatchCount : null },
    { id: 'matches', label: 'MATCHES', icon: 'fa-calendar-days' },
    { id: 'leagues', label: 'LEAGUES', icon: 'fa-trophy' },
    { id: 'news', label: 'NEWS', icon: 'fa-newspaper' }
  ];

  return (
    <nav 
      aria-label="Primary Mobile Navigation"
      className="fixed bottom-3 left-2 right-2 sm:left-4 sm:right-4 z-40 max-w-xl mx-auto bg-slate-950/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.85)] p-1.5 flex items-center justify-between"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id as MainTab)}
            aria-current={isActive ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center flex-1 min-h-[44px] py-1.5 px-1 rounded-xl transition-colors cursor-pointer select-none ${
              isActive
                ? 'text-black bg-[var(--primary-color)] font-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10'
            }`}
          >
            {tab.badge && !isActive && (
              <span className="absolute top-1 right-2.5 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            <i className={`fa-solid ${tab.icon} text-sm sm:text-base mb-1`}></i>
            <span className="text-[10px] sm:text-[11px] font-display uppercase tracking-wider leading-none">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
