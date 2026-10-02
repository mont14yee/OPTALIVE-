import React, { useState, useEffect, useCallback } from 'react';
import { Competition, Fixture, ApiStatus } from './types/football';
import { footballClient } from './api/footballClient';
import { Header } from './components/Header';
import { CompetitionsBar } from './components/CompetitionsBar';
import { HomeView } from './components/HomeView';
import { LiveCenter } from './components/LiveCenter/LiveCenter';
import { MatchCenterModal } from './components/LiveCenter/MatchCenterModal';
import { LeagueHub } from './components/LeagueHub/LeagueHub';
import { NewsView } from './components/NewsView/NewsView';
import { ScheduleView } from './components/ScheduleView/ScheduleView';
import { TeamProfileView } from './components/TeamProfile/TeamProfileView';
import { PlayerProfileView } from './components/PlayerProfile/PlayerProfileView';
import { SearchModal } from './components/SearchModal';
import { FavouritesModal } from './components/FavouritesModal';
import { SettingsModal } from './components/SettingsModal';
import { BottomNav, MainTab } from './components/BottomNav';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedFixtureForModal, setSelectedFixtureForModal] = useState<Fixture | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Secondary Action Modals
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFavouritesOpen, setIsFavouritesOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Restore saved theme on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('themeColor');
    const savedRgb = localStorage.getItem('themeRgb');
    if (savedColor) document.documentElement.style.setProperty('--primary-color', savedColor);
    if (savedRgb) document.documentElement.style.setProperty('--primary-rgb', savedRgb);
  }, []);

  // Fetch API Status & Competitions
  const loadSystemMetadata = useCallback(async () => {
    try {
      const [status, comps] = await Promise.all([
        footballClient.getStatus(),
        footballClient.getCompetitions()
      ]);
      setApiStatus(status);
      setCompetitions(comps);
    } catch (err) {
      console.error('System metadata load failed:', err);
    }
  }, []);

  // Fetch Fixtures based on selected date & competition
  const loadFixtures = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const data = await footballClient.getFixtures(selectedDate, selectedCompetitionId);
      setFixtures(data);
    } catch (err) {
      console.error('Failed to load fixtures:', err);
    } finally {
      if (isManualRefresh) setIsRefreshing(false);
      setLoadingInitial(false);
    }
  }, [selectedDate, selectedCompetitionId]);

  useEffect(() => {
    loadSystemMetadata();
  }, [loadSystemMetadata]);

  useEffect(() => {
    loadFixtures(false);
  }, [loadFixtures]);

  // Periodic polling for live scores every 25 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'live' || activeTab === 'home' || activeTab === 'matches') {
        footballClient
          .getFixtures(selectedDate, selectedCompetitionId)
          .then((updated) => setFixtures(updated))
          .catch(() => {});
      }
    }, 25000);

    return () => clearInterval(interval);
  }, [activeTab, selectedDate, selectedCompetitionId]);

  const liveMatchesCount = fixtures.filter(f => f.isLive || f.status === 'LIVE' || f.status === 'HT').length;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col relative selection:bg-[var(--primary-color)] selection:text-black overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[var(--primary-color)]/10 rounded-full blur-[140px]"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[160px]"></div>
      </div>

      {/* Offline Status Notification */}
      {isOffline && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-center text-xs font-mono font-bold flex items-center justify-center gap-2 sticky top-0 z-50 backdrop-blur-md">
          <i className="fa-solid fa-wifi-slash text-amber-400"></i>
          <span>You are currently offline. Displaying cached verified football data.</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        apiStatus={apiStatus}
        onRefresh={() => loadFixtures(true)}
        isRefreshing={isRefreshing}
        selectedDate={selectedDate}
        onDateChange={(d) => setSelectedDate(d)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenFavourites={() => setIsFavouritesOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 md:px-8 pt-4 sm:pt-6 pb-28 relative z-10 space-y-6">
        {/* Competitions strip (shown for Matches tab) */}
        {activeTab === 'matches' && competitions.length > 0 && !selectedPlayerId && !selectedTeamId && (
          <CompetitionsBar
            competitions={competitions}
            selectedCompetitionId={selectedCompetitionId}
            onSelectCompetition={(id) => setSelectedCompetitionId(id)}
          />
        )}

        {/* View Switcher */}
        {loadingInitial ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--primary-color)] border-t-transparent animate-spin mx-auto"></div>
            <p className="font-mono text-xs text-slate-400 uppercase tracking-widest animate-pulse">
              Connecting to OPTALIVE Football Telemetry Core...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Player Profile View (Highest specificity when player selected) */}
            {selectedPlayerId ? (
              <PlayerProfileView
                playerId={selectedPlayerId}
                onBack={() => setSelectedPlayerId(null)}
                onSelectTeam={(teamId) => {
                  setSelectedPlayerId(null);
                  setSelectedTeamId(teamId);
                }}
                onSelectPlayer={(pid) => setSelectedPlayerId(pid)}
                onSelectFixture={(fixture) => setSelectedFixtureForModal(fixture)}
              />
            ) : selectedTeamId ? (
              /* 2. Team Profile View (When team selected) */
              <TeamProfileView
                teamId={selectedTeamId}
                onBack={() => setSelectedTeamId(null)}
                onSelectPlayer={(playerId) => {
                  setSelectedTeamId(null);
                  setSelectedPlayerId(playerId);
                }}
                onSelectTeam={(teamId) => setSelectedTeamId(teamId)}
                onSelectFixture={(fixture) => setSelectedFixtureForModal(fixture)}
              />
            ) : (
              /* 3. Primary Mobile Navigation Views */
              <>
                {activeTab === 'home' && (
                  <HomeView
                    competitions={competitions}
                    fixtures={fixtures}
                    onSelectFixture={(fixture) => setSelectedFixtureForModal(fixture)}
                    onSelectCompetition={(compId) => {
                      setSelectedCompetitionId(compId);
                      setActiveTab('leagues');
                    }}
                    onSelectTeam={(teamId) => setSelectedTeamId(teamId)}
                    onNavigateTab={(tab) => {
                      setSelectedPlayerId(null);
                      setSelectedTeamId(null);
                      setActiveTab(tab);
                    }}
                    onOpenFavourites={() => setIsFavouritesOpen(true)}
                  />
                )}

                {activeTab === 'live' && (
                  <LiveCenter
                    competitions={competitions}
                    onOpenMatchModal={(fixture) => setSelectedFixtureForModal(fixture)}
                    onSelectTeam={(teamId) => setSelectedTeamId(teamId)}
                    onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
                  />
                )}

                {activeTab === 'matches' && (
                  <ScheduleView
                    competitions={competitions}
                    onSelectFixture={(fixture) => setSelectedFixtureForModal(fixture)}
                    onSelectTeam={(teamId) => setSelectedTeamId(teamId)}
                  />
                )}

                {activeTab === 'leagues' && (
                  <LeagueHub
                    competitions={competitions}
                    initialCompetitionId={selectedCompetitionId !== 'all' ? selectedCompetitionId : 'epl'}
                    onSelectFixture={(fixture) => setSelectedFixtureForModal(fixture)}
                    onSelectTeam={(teamId) => setSelectedTeamId(teamId)}
                    onSelectPlayer={(playerId) => setSelectedPlayerId(playerId)}
                  />
                )}

                {activeTab === 'news' && (
                  <NewsView
                    competitions={competitions}
                    onOpenMatchCenter={(fixtureId) => {
                      const match = fixtures.find((f) => f.id === fixtureId);
                      if (match) {
                        setSelectedFixtureForModal(match);
                      } else {
                        footballClient
                          .getMatchDetails(fixtureId)
                          .then((f) => setSelectedFixtureForModal(f))
                          .catch((err) => console.error('Match open failed:', err));
                      }
                    }}
                  />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Interactive Match Telemetry Modal */}
      {selectedFixtureForModal && (
        <MatchCenterModal
          fixture={selectedFixtureForModal}
          onClose={() => setSelectedFixtureForModal(null)}
          onSelectTeam={(teamId) => {
            setSelectedFixtureForModal(null);
            setSelectedPlayerId(null);
            setSelectedTeamId(teamId);
          }}
          onSelectPlayer={(playerId) => {
            setSelectedFixtureForModal(null);
            setSelectedTeamId(null);
            setSelectedPlayerId(playerId);
          }}
        />
      )}

      {/* Secondary Action: Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        competitions={competitions}
        onSelectTeam={(teamId) => {
          setIsSearchOpen(false);
          setSelectedPlayerId(null);
          setSelectedTeamId(teamId);
        }}
        onSelectPlayer={(playerId) => {
          setIsSearchOpen(false);
          setSelectedTeamId(null);
          setSelectedPlayerId(playerId);
        }}
        onSelectFixture={(fixture) => {
          setIsSearchOpen(false);
          setSelectedFixtureForModal(fixture);
        }}
        onSelectCompetition={(compId) => {
          setIsSearchOpen(false);
          setSelectedCompetitionId(compId);
          setSelectedTeamId(null);
          setSelectedPlayerId(null);
          setActiveTab('leagues');
        }}
      />

      {/* Secondary Action: Favourites Modal */}
      <FavouritesModal
        isOpen={isFavouritesOpen}
        onClose={() => setIsFavouritesOpen(false)}
        onSelectTeam={(teamId) => {
          setIsFavouritesOpen(false);
          setSelectedPlayerId(null);
          setSelectedTeamId(teamId);
        }}
        onSelectFixture={(fixture) => {
          setIsFavouritesOpen(false);
          setSelectedFixtureForModal(fixture);
        }}
        onSelectPlayer={(playerId) => {
          setIsFavouritesOpen(false);
          setSelectedTeamId(null);
          setSelectedPlayerId(playerId);
        }}
        onSelectCompetition={(compId) => {
          setIsFavouritesOpen(false);
          setSelectedCompetitionId(compId);
          setSelectedTeamId(null);
          setSelectedPlayerId(null);
          setActiveTab('leagues');
        }}
      />

      {/* Secondary Action: Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiStatus={apiStatus}
      />

      {/* Persistent Floating Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(t) => {
          setSelectedPlayerId(null);
          setSelectedTeamId(null);
          setActiveTab(t);
        }}
        liveMatchCount={liveMatchesCount}
      />
    </div>
  );
};
