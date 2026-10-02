import React, { useState, useEffect } from 'react';
import {
  Competition,
  Fixture,
  LeagueStandings,
  TopScorer,
  Team,
  NewsArticle
} from '../../types/football';
import { footballClient } from '../../api/footballClient';
import { CompetitionSelector } from './CompetitionSelector';
import { LeagueOverviewTab } from './LeagueOverviewTab';
import { LeagueMatchesTab } from './LeagueMatchesTab';
import { LeagueTableTab } from './LeagueTableTab';
import { LeagueTopScorersTab } from './LeagueTopScorersTab';
import { LeagueTeamsTab } from './LeagueTeamsTab';
import { LeagueNewsTab } from './LeagueNewsTab';

export type LeagueHubTab = 'overview' | 'matches' | 'table' | 'topscorers' | 'teams' | 'news';

interface LeagueHubProps {
  competitions: Competition[];
  initialCompetitionId?: string;
  onSelectFixture: (fixture: Fixture) => void;
  onSelectTeam?: (teamId: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const LeagueHub: React.FC<LeagueHubProps> = ({
  competitions,
  initialCompetitionId = 'epl',
  onSelectFixture,
  onSelectTeam,
  onSelectPlayer
}) => {
  const [selectedCompId, setSelectedCompId] = useState<string>(initialCompetitionId);
  const [activeTab, setActiveTab] = useState<LeagueHubTab>('overview');

  // League data states
  const [standings, setStandings] = useState<LeagueStandings | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);

  // Loading & error states
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Active competition object
  const activeCompetition =
    competitions.find((c) => c.id.toLowerCase() === selectedCompId.toLowerCase()) ||
    competitions[0] || {
      id: selectedCompId,
      name: 'Competition',
      shortName: 'League',
      code: 'LG'
    };

  // Fetch all domain data for the selected competition
  const loadCompetitionData = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [
        standingsRes,
        fixturesRes,
        topScorersRes,
        teamsRes,
        newsRes
      ] = await Promise.allSettled([
        footballClient.getStandings(selectedCompId),
        footballClient.getLeagueFixtures(selectedCompId),
        footballClient.getTopScorers(selectedCompId),
        footballClient.getLeagueTeams(selectedCompId),
        footballClient.getNews()
      ]);

      if (standingsRes.status === 'fulfilled') {
        setStandings(standingsRes.value);
      } else {
        setStandings(null);
      }

      if (fixturesRes.status === 'fulfilled') {
        setFixtures(fixturesRes.value);
      } else {
        setFixtures([]);
      }

      if (topScorersRes.status === 'fulfilled') {
        setTopScorers(topScorersRes.value);
      } else {
        setTopScorers([]);
      }

      if (teamsRes.status === 'fulfilled') {
        setTeams(teamsRes.value);
      } else if (standingsRes.status === 'fulfilled' && standingsRes.value?.table) {
        // Fallback to table teams
        setTeams(standingsRes.value.table.map((r) => r.team));
      } else {
        setTeams([]);
      }

      if (newsRes.status === 'fulfilled') {
        setNews(newsRes.value);
      }
    } catch (err: any) {
      console.error('Failed to load league hub data:', err);
      setError('Unable to synchronize data with football provider.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCompetitionData();
  }, [selectedCompId]);

  const tabs: { id: LeagueHubTab; label: string; icon: string }[] = [
    { id: 'overview', label: 'OVERVIEW', icon: 'fa-chart-pie' },
    { id: 'matches', label: 'MATCHES', icon: 'fa-futbol' },
    { id: 'table', label: 'TABLE', icon: 'fa-table-list' },
    { id: 'topscorers', label: 'TOP SCORERS', icon: 'fa-ranking-star' },
    { id: 'teams', label: 'TEAMS', icon: 'fa-shield-halved' },
    { id: 'news', label: 'NEWS', icon: 'fa-newspaper' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* 1. Competition Selector */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--primary-color)]"></span>
            <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold">
              Official League Hub
            </span>
          </div>

          <button
            onClick={() => loadCompetitionData(true)}
            disabled={isRefreshing || loading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-[11px] transition-all cursor-pointer disabled:opacity-50"
            title="Refresh League Data"
          >
            <i className={`fa-solid fa-arrows-rotate text-[10px] ${isRefreshing ? 'animate-spin text-[var(--primary-color)]' : ''}`}></i>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <CompetitionSelector
          competitions={competitions}
          selectedCompetitionId={selectedCompId}
          onSelectCompetition={(id) => setSelectedCompId(id)}
        />
      </div>

      {/* 2. League Hero Banner */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-white/10 rounded-3xl p-5 md:p-7 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--primary-color)]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/15 p-2 flex items-center justify-center flex-shrink-0 shadow-lg">
              {activeCompetition.logoUrl ? (
                <img
                  src={activeCompetition.logoUrl}
                  alt={activeCompetition.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <i className="fa-solid fa-trophy text-2xl text-[var(--primary-color)]"></i>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-[var(--primary-color)]/20 text-[var(--primary-color)] text-[10px] font-mono font-bold uppercase tracking-wider border border-[var(--primary-color)]/30">
                  {activeCompetition.country || 'International'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {activeCompetition.season || '2024/25'} Season
                </span>
              </div>
              <h1 className="font-display font-black text-2xl md:text-4xl text-white uppercase tracking-tight">
                {activeCompetition.name}
              </h1>
              <p className="font-mono text-xs text-slate-400 mt-1">
                Real-Time Tables • Fixture Center • Golden Boot • Tactical Intelligence
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-3 font-mono text-center">
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5">
              <span className="block font-display font-black text-lg md:text-xl text-[var(--primary-color)]">
                {fixtures.length}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Fixtures</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5">
              <span className="block font-display font-black text-lg md:text-xl text-white">
                {standings?.table.length || teams.length}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Clubs</span>
            </div>
            <div className="bg-slate-950/60 border border-white/10 rounded-2xl px-4 py-2.5">
              <span className="block font-display font-black text-lg md:text-xl text-amber-400">
                {topScorers.length}
              </span>
              <span className="text-[9px] text-slate-400 uppercase tracking-widest">Scorers</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-bold uppercase tracking-wider text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[var(--primary-color)] text-black shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)] scale-[1.02]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-xs`}></i>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Notice if any */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-xs font-mono">
          <i className="fa-solid fa-triangle-exclamation text-rose-400 text-sm"></i>
          <span>{error}</span>
        </div>
      )}

      {/* 4. Active Tab Content View */}
      {activeTab === 'overview' && (
        <LeagueOverviewTab
          standings={standings}
          fixtures={fixtures}
          onSelectFixture={onSelectFixture}
          onViewAllMatches={() => setActiveTab('matches')}
          onViewTable={() => setActiveTab('table')}
          onSelectTeam={onSelectTeam}
        />
      )}

      {activeTab === 'matches' && (
        <LeagueMatchesTab
          fixtures={fixtures}
          onSelectFixture={onSelectFixture}
        />
      )}

      {activeTab === 'table' && (
        <LeagueTableTab
          standings={standings}
          loading={loading}
          onSelectTeam={onSelectTeam}
        />
      )}

      {activeTab === 'topscorers' && (
        <LeagueTopScorersTab
          topScorers={topScorers}
          loading={loading}
          onSelectPlayer={onSelectPlayer}
          onSelectTeam={onSelectTeam}
        />
      )}

      {activeTab === 'teams' && (
        <LeagueTeamsTab
          teams={teams}
          loading={loading}
          onSelectTeam={onSelectTeam}
        />
      )}

      {activeTab === 'news' && (
        <LeagueNewsTab
          news={news}
          competition={activeCompetition}
          loading={loading}
        />
      )}
    </div>
  );
};
