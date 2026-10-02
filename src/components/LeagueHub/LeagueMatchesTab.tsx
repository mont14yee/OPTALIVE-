import React, { useState } from 'react';
import { Fixture } from '../../types/football';
import { MatchCard, EmptyState } from '../common';

interface LeagueMatchesTabProps {
  fixtures: Fixture[];
  onSelectFixture: (fixture) => void;
}

type MatchesFilterType = 'all' | 'previous' | 'today' | 'upcoming';

export const LeagueMatchesTab: React.FC<LeagueMatchesTabProps> = ({
  fixtures,
  onSelectFixture
}) => {
  const [filter, setFilter] = useState<MatchesFilterType>('all');

  const isMatchToday = (startingAt?: string) => {
    if (!startingAt) return false;
    const date = new Date(startingAt);
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const previousFixtures = fixtures.filter((f) => f.status === 'FT');
  const todayFixtures = fixtures.filter(
    (f) => f.isLive || f.status === 'LIVE' || f.status === 'HT' || isMatchToday(f.startingAt)
  );
  const upcomingFixtures = fixtures.filter((f) => f.status === 'NS');

  let displayedFixtures = fixtures;
  if (filter === 'previous') displayedFixtures = previousFixtures;
  if (filter === 'today') displayedFixtures = todayFixtures;
  if (filter === 'upcoming') displayedFixtures = upcomingFixtures;

  return (
    <div className="space-y-6">
      {/* Sub-category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[var(--primary-color)] text-black shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Matches ({fixtures.length})
          </button>

          <button
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'today'
                ? 'bg-[var(--primary-color)] text-black shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Today ({todayFixtures.length})
          </button>

          <button
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-[var(--primary-color)] text-black shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Upcoming ({upcomingFixtures.length})
          </button>

          <button
            onClick={() => setFilter('previous')}
            className={`px-3 py-1.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs transition-all cursor-pointer ${
              filter === 'previous'
                ? 'bg-[var(--primary-color)] text-black shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Results ({previousFixtures.length})
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block px-2">
          Click match to open Match Center
        </span>
      </div>

      {/* Matches Grid */}
      {displayedFixtures.length === 0 ? (
        <EmptyState
          icon="fa-calendar-xmark"
          title="No Fixtures Found"
          description="No fixtures match the selected filter category for this competition."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedFixtures.map((fixture) => (
            <MatchCard
              key={fixture.id}
              fixture={fixture}
              onClick={onSelectFixture}
            />
          ))}
        </div>
      )}
    </div>
  );
};
