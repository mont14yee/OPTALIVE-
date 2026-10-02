import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Fixture, Competition, Team } from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { ScheduleFixtureCard } from './ScheduleFixtureCard';
import { ScheduleSkeleton } from './ScheduleSkeleton';
import { CalendarStrip } from './CalendarStrip';
import { DatePickerModal } from './DatePickerModal';
import {
  getUserTimezone,
  getTimezoneAbbreviation,
  formatCalendarDateOnly,
  isDateOnly,
  getRelativeDayLabel
} from '../../utils/footballDates';

export type DateFilterPreset = 'today' | 'tomorrow' | 'this_week' | 'next_week' | 'custom';
export type StatusFilterOption = 'all' | 'live' | 'scheduled' | 'finished' | 'postponed';

interface ScheduleViewProps {
  competitions?: Competition[];
  onSelectFixture: (fixture: Fixture) => void;
  onSelectTeam?: (teamId: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  competitions = [],
  onSelectFixture,
  onSelectTeam
}) => {
  // Primary Quick Date Preset ('today' | 'tomorrow' | 'this_week' | 'next_week' | 'custom')
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('today');
  // Selected custom ISO date string: 'YYYY-MM-DD'
  const [customIsoDate, setCustomIsoDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  // Modal visibility
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);

  // Filters
  const [selectedCompId, setSelectedCompId] = useState<string>('all');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilterOption>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fixtures and Data State
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  // Grouping preference
  const [groupByCompetition, setGroupByCompetition] = useState<boolean>(true);

  // Timezone display
  const userTimezone = useMemo(() => getUserTimezone(), []);
  const tzAbbreviation = useMemo(() => getTimezoneAbbreviation(new Date(), userTimezone), [userTimezone]);

  // "Updated X seconds ago" ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSyncTime.getTime()) / 1000);
      setSecondsAgo(Math.max(0, elapsed));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSyncTime]);

  // Determine current effective date query parameter
  const effectiveDateParam = useMemo(() => {
    if (datePreset === 'custom') return customIsoDate;
    return datePreset;
  }, [datePreset, customIsoDate]);

  // Fetch fixtures from backend API
  const fetchFixtures = useCallback(
    async (isManual = false) => {
      if (isManual) setIsRefreshing(true);
      setApiError(null);

      try {
        const data = await footballClient.getFixtures(
          effectiveDateParam,
          selectedCompId !== 'all' ? selectedCompId : undefined,
          selectedStatus !== 'all' ? selectedStatus : undefined,
          selectedTeamId !== 'all' ? selectedTeamId : undefined
        );
        setFixtures(data);
        setLastSyncTime(new Date());
        setSecondsAgo(0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to retrieve schedule';
        console.warn('Schedule fetch error:', msg);
        setApiError(msg);
      } finally {
        setIsLoading(false);
        if (isManual) setIsRefreshing(false);
      }
    },
    [effectiveDateParam, selectedCompId, selectedStatus, selectedTeamId]
  );

  // Fetch on filter change
  useEffect(() => {
    fetchFixtures(false);
  }, [fetchFixtures]);

  // Extract all unique teams from fixtures and competitions to populate the team filter dropdown
  const availableTeams = useMemo(() => {
    const teamMap = new Map<string, Team>();
    fixtures.forEach((f) => {
      if (f.homeTeam) teamMap.set(f.homeTeam.id, f.homeTeam);
      if (f.awayTeam) teamMap.set(f.awayTeam.id, f.awayTeam);
    });
    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [fixtures]);

  // Filter fixtures locally by search query as well
  const filteredFixtures = useMemo(() => {
    if (!searchQuery.trim()) return fixtures;

    const q = searchQuery.toLowerCase().trim();
    return fixtures.filter((f) => {
      const home = f.homeTeam.name.toLowerCase();
      const away = f.awayTeam.name.toLowerCase();
      const comp = f.competition.name.toLowerCase();
      const venue = (f.venue || '').toLowerCase();
      const ref = (f.referee || '').toLowerCase();
      return home.includes(q) || away.includes(q) || comp.includes(q) || venue.includes(q) || ref.includes(q);
    });
  }, [fixtures, searchQuery]);

  // Group fixtures by competition if enabled
  const groupedFixtures = useMemo(() => {
    if (!groupByCompetition) return null;

    const fallbackComp: Competition = {
      id: 'other',
      name: 'Other Matches',
      shortName: 'Other',
      code: 'OTH',
      country: 'Global',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg',
      colorGradient: 'from-slate-800 to-black'
    };

    const map = new Map<string, { competition: Competition; fixtures: Fixture[] }>();
    filteredFixtures.forEach((f) => {
      const comp = f.competition || fallbackComp;
      const cid = comp.id || 'other';
      if (!map.has(cid)) {
        map.set(cid, { competition: comp, fixtures: [] });
      }
      map.get(cid)!.fixtures.push(f);
    });
    return Array.from(map.values());
  }, [filteredFixtures, groupByCompetition]);

  // Quick Preset Selection Handlers
  const handleSelectPreset = (preset: DateFilterPreset) => {
    if (preset === 'custom') {
      setIsDatePickerOpen(true);
      return;
    }
    setDatePreset(preset);
  };

  const handleSelectCalendarDate = (isoDate: string) => {
    if (isoDate === 'today') {
      setDatePreset('today');
      return;
    }
    setCustomIsoDate(isoDate);
    setDatePreset('custom');
  };

  // Reset all filters
  const handleResetFilters = () => {
    setDatePreset('today');
    setSelectedCompId('all');
    setSelectedTeamId('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    let live = 0;
    let scheduled = 0;
    let finished = 0;
    let postponed = 0;

    fixtures.forEach((f) => {
      if (f.isLive || f.status === 'LIVE' || f.status === 'HT') live++;
      else if (f.status === 'NS') scheduled++;
      else if (f.status === 'FT' || f.status === 'AET' || f.status === 'PEN') finished++;
      else if (f.status === 'PST' || f.status === 'CANC') postponed++;
    });

    return { all: fixtures.length, live, scheduled, finished, postponed };
  }, [fixtures]);

  const renderUpdatedTicker = () => {
    if (secondsAgo <= 1) return 'Updated just now';
    if (secondsAgo < 60) return `Updated ${secondsAgo}s ago`;
    return `Updated ${Math.floor(secondsAgo / 60)}m ago`;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls Card */}
      <div className="bg-slate-900/60 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md space-y-5">
        {/* Top Title & Telemetry Meta */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-color)]/20 border border-[var(--primary-color)]/30 flex items-center justify-center text-[var(--primary-color)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
              <i className="fa-solid fa-calendar-days text-lg"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-black uppercase text-lg md:text-xl text-white tracking-wider">
                  Football Schedule
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  CANONICAL TIMESTAMPS
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
                <span>{renderUpdatedTicker()}</span>
                <span>•</span>
                <span className="text-[var(--primary-color)] font-semibold">
                  Local Timezone: {userTimezone} ({tzAbbreviation})
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar: Grouping toggle, Search input & Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search club, venue, referee..."
                className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </div>

            {/* Group By League Toggle */}
            <button
              type="button"
              onClick={() => setGroupByCompetition((g) => !g)}
              title={groupByCompetition ? 'Switch to chronological flat view' : 'Group fixtures by competition'}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                groupByCompetition
                  ? 'bg-white/15 text-white border-white/20'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              <i className="fa-solid fa-layer-group text-xs"></i>
              <span className="hidden sm:inline">Group Leagues</span>
            </button>

            {/* Refresh Control */}
            <button
              type="button"
              onClick={() => fetchFixtures(true)}
              disabled={isRefreshing}
              title="Refresh schedule telemetry"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate text-xs ${isRefreshing ? 'animate-spin text-[var(--primary-color)]' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          </div>
        </div>

        {/* 2. Quick Date Filters Strip: TODAY | TOMORROW | THIS WEEK | NEXT WEEK | DATE PICKER */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
          {[
            { id: 'today', label: 'TODAY', icon: 'fa-solid fa-calendar-day' },
            { id: 'tomorrow', label: 'TOMORROW', icon: 'fa-regular fa-sun' },
            { id: 'this_week', label: 'THIS WEEK', icon: 'fa-solid fa-calendar-week' },
            { id: 'next_week', label: 'NEXT WEEK', icon: 'fa-solid fa-forward' },
            { id: 'custom', label: 'DATE PICKER', icon: 'fa-regular fa-calendar-days', isPicker: true }
          ].map((tab) => {
            const isTabActive = datePreset === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectPreset(tab.id as DateFilterPreset)}
                className={`py-2.5 px-3 rounded-xl font-display font-bold uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isTabActive
                    ? 'bg-[var(--primary-color)] text-black border-[var(--primary-color)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)] font-black'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                }`}
              >
                <i className={`${tab.icon} text-xs ${isTabActive ? 'text-black' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.isPicker && isTabActive && datePreset === 'custom' && (
                  <span className="text-[10px] font-mono bg-black/30 px-1.5 py-0.2 rounded">
                    {customIsoDate.slice(5)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Calendar Navigation Strip */}
        <CalendarStrip
          selectedDate={datePreset === 'custom' ? customIsoDate : datePreset}
          onSelectDate={handleSelectCalendarDate}
          onOpenDatePicker={() => setIsDatePickerOpen(true)}
        />

        {/* 4. Filter Rows: Competition, Team & Match Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/5">
          {/* Competition Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <i className="fa-solid fa-trophy text-[var(--primary-color)] text-[10px]"></i>
              Competition
            </label>
            <select
              value={selectedCompId}
              onChange={(e) => setSelectedCompId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Competitions ({competitions.length})</option>
              {competitions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code || c.country})
                </option>
              ))}
            </select>
          </div>

          {/* Team Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <i className="fa-solid fa-shield text-[var(--primary-color)] text-[10px]"></i>
              Club / Team
            </label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Clubs ({availableTeams.length})</option>
              {availableTeams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Match Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <i className="fa-solid fa-sliders text-[var(--primary-color)] text-[10px]"></i>
              Match Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as StatusFilterOption)}
              className="w-full bg-black/40 border border-white/10 focus:border-[var(--primary-color)] rounded-xl px-3 py-2 text-xs text-white font-mono outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({statusCounts.all})</option>
              <option value="scheduled">Scheduled / Upcoming ({statusCounts.scheduled})</option>
              <option value="live">Live In-Play ({statusCounts.live})</option>
              <option value="finished">Finished ({statusCounts.finished})</option>
              <option value="postponed">Postponed / Cancelled ({statusCounts.postponed})</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Tag Badges if any non-default is active */}
        {(selectedCompId !== 'all' || selectedTeamId !== 'all' || selectedStatus !== 'all' || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[10px] font-mono text-slate-400">Active Filters:</span>

            {selectedCompId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                League: {competitions.find((c) => c.id === selectedCompId)?.shortName || selectedCompId}
                <button
                  type="button"
                  onClick={() => setSelectedCompId('all')}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}

            {selectedTeamId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                Club: {availableTeams.find((t) => t.id === selectedTeamId)?.name || selectedTeamId}
                <button
                  type="button"
                  onClick={() => setSelectedTeamId('all')}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}

            {selectedStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                Status: {selectedStatus.toUpperCase()}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('all')}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-mono text-[10px]">
                Query: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-1 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] font-mono text-[var(--primary-color)] hover:underline ml-auto"
            >
              Reset All
            </button>
          </div>
        )}
      </div>

      {/* 5. Error State Banner */}
      {apiError && (
        <div className="bg-rose-950/70 border border-rose-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 text-rose-200 text-xs font-mono shadow-xl animate-shake">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
              <i className="fa-solid fa-triangle-exclamation text-base"></i>
            </div>
            <div>
              <p className="font-bold text-white">Schedule Sync Error</p>
              <p className="text-rose-300 text-[11px]">{apiError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchFixtures(true)}
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-display font-bold uppercase text-[11px] tracking-wider transition-colors cursor-pointer flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* 6. Fixtures Display Area */}
      {isLoading ? (
        <ScheduleSkeleton />
      ) : filteredFixtures.length === 0 ? (
        /* Empty State */
        <div className="py-20 text-center bg-slate-900/30 rounded-3xl border border-white/5 space-y-4 p-8 max-w-lg mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mx-auto text-2xl">
            <i className="fa-regular fa-calendar-xmark"></i>
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-black uppercase text-white text-base tracking-wider">
              No Matches Found
            </h3>
            <p className="text-xs font-mono text-slate-400 leading-relaxed">
              {searchQuery
                ? `No fixtures match "${searchQuery}" for the selected criteria.`
                : 'There are no fixtures scheduled for this date and filter configuration.'}
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[var(--primary-color)] text-black font-display font-black uppercase text-xs tracking-wider hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <i className="fa-solid fa-rotate-left"></i>
              Reset Filters
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('today')}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors cursor-pointer"
            >
              Browse Today's Matches
            </button>
          </div>
        </div>
      ) : groupByCompetition && groupedFixtures ? (
        /* Grouped Fixture View */
        <div className="space-y-8">
          {groupedFixtures.map((group) => (
            <div key={group.competition.id} className="space-y-3">
              {/* Competition Header Strip */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
                <div className="flex items-center gap-2.5">
                  {group.competition?.logoUrl && (
                    <img
                      src={group.competition.logoUrl}
                      alt={group.competition.name || 'Competition'}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  )}
                  <h3 className="font-display font-black uppercase text-sm md:text-base text-white tracking-wider">
                    {group.competition?.name || 'Competition'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({group.competition?.country || 'Global'})
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {group.fixtures.length} {group.fixtures.length === 1 ? 'fixture' : 'fixtures'}
                </span>
              </div>

              {/* Cards in this league */}
              <div className="grid grid-cols-1 gap-3">
                {group.fixtures.map((fixture) => (
                  <ScheduleFixtureCard
                    key={fixture.id}
                    fixture={fixture}
                    onSelect={onSelectFixture}
                    onSelectTeam={onSelectTeam}
                    timezone={userTimezone}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat Chronological View */
        <div className="grid grid-cols-1 gap-3">
          {filteredFixtures.map((fixture) => (
            <ScheduleFixtureCard
              key={fixture.id}
              fixture={fixture}
              onSelect={onSelectFixture}
              onSelectTeam={onSelectTeam}
              timezone={userTimezone}
            />
          ))}
        </div>
      )}

      {/* Date Picker Modal */}
      {isDatePickerOpen && (
        <DatePickerModal
          currentDateIso={customIsoDate}
          onSelectDate={(iso) => {
            setCustomIsoDate(iso);
            setDatePreset('custom');
          }}
          onClose={() => setIsDatePickerOpen(false)}
        />
      )}
    </div>
  );
};
