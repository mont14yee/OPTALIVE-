import { 
  Competition, 
  Fixture, 
  LeagueStandings, 
  NewsArticle, 
  HighlightItem, 
  TacticalAnalysis,
  ApiStatus,
  ApiResponse,
  MatchEvent,
  MatchStatistics,
  Lineup,
  Team,
  Player,
  TopScorer,
  TeamProfile,
  PlayerProfile,
  GlobalSearchResult,
  AiFootballIntelligence,
  AiIntelligenceType
} from '../types/football';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || data.success === false) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  // If response follows ApiResponse envelope, return data payload
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return (data as ApiResponse<T>).data;
  }

  return data as T;
}

async function fetchEnvelope<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(url, options);
  const data = await res.json();

  if (!res.ok || data.success === false) {
    const errorMsg = data?.error?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as ApiResponse<T>;
}

export const footballClient = {
  async getStatus(): Promise<ApiStatus> {
    return fetchJson<ApiStatus>(`${API_BASE}/status`);
  },

  async getCompetitions(): Promise<Competition[]> {
    return fetchJson<Competition[]>(`${API_BASE}/football/leagues`);
  },

  async getLiveMatches(): Promise<Fixture[]> {
    return fetchJson<Fixture[]>(`${API_BASE}/football/live`);
  },

  async getLiveMatchesEnvelope(): Promise<ApiResponse<Fixture[]>> {
    return fetchEnvelope<Fixture[]>(`${API_BASE}/football/live`);
  },

  async getFixtures(date?: string, competitionId?: string, status?: string, teamId?: string): Promise<Fixture[]> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (competitionId && competitionId !== 'all') params.set('league_id', competitionId);
    if (status && status !== 'all') params.set('status', status);
    if (teamId && teamId !== 'all') params.set('team_id', teamId);

    return fetchJson<Fixture[]>(`${API_BASE}/football/matches?${params.toString()}`);
  },

  async getFixturesEnvelope(date?: string, competitionId?: string, status?: string, teamId?: string): Promise<ApiResponse<Fixture[]>> {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (competitionId && competitionId !== 'all') params.set('league_id', competitionId);
    if (status && status !== 'all') params.set('status', status);
    if (teamId && teamId !== 'all') params.set('team_id', teamId);

    return fetchEnvelope<Fixture[]>(`${API_BASE}/football/matches?${params.toString()}`);
  },

  async getMatchDetails(fixtureId: string): Promise<Fixture> {
    return fetchJson<Fixture>(`${API_BASE}/football/matches/${encodeURIComponent(fixtureId)}`);
  },

  async getMatchEvents(fixtureId: string): Promise<MatchEvent[]> {
    return fetchJson<MatchEvent[]>(`${API_BASE}/football/matches/${encodeURIComponent(fixtureId)}/events`);
  },

  async getMatchStats(fixtureId: string): Promise<MatchStatistics> {
    return fetchJson<MatchStatistics>(`${API_BASE}/football/matches/${encodeURIComponent(fixtureId)}/stats`);
  },

  async getMatchLineups(fixtureId: string): Promise<{ home: Lineup; away: Lineup }> {
    return fetchJson<{ home: Lineup; away: Lineup }>(`${API_BASE}/football/matches/${encodeURIComponent(fixtureId)}/lineups`);
  },

  async getStandings(competitionId: string): Promise<LeagueStandings> {
    return fetchJson<LeagueStandings>(`${API_BASE}/football/leagues/${encodeURIComponent(competitionId)}/standings`);
  },

  async getTopScorers(competitionId: string): Promise<TopScorer[]> {
    return fetchJson<TopScorer[]>(`${API_BASE}/football/leagues/${encodeURIComponent(competitionId)}/topscorers`);
  },

  async getLeagueTeams(competitionId: string): Promise<Team[]> {
    return fetchJson<Team[]>(`${API_BASE}/football/leagues/${encodeURIComponent(competitionId)}/teams`);
  },

  async getLeagueFixtures(leagueId: string, page = 1): Promise<Fixture[]> {
    return fetchJson<Fixture[]>(`${API_BASE}/football/leagues/${encodeURIComponent(leagueId)}/fixtures?page=${page}`);
  },

  async getTeam(teamId: string): Promise<Team> {
    return fetchJson<Team>(`${API_BASE}/football/teams/${encodeURIComponent(teamId)}`);
  },

  async getTeamProfile(teamId: string): Promise<TeamProfile> {
    return fetchJson<TeamProfile>(`${API_BASE}/football/teams/${encodeURIComponent(teamId)}/profile`);
  },

  async getAllTeams(): Promise<Team[]> {
    return fetchJson<Team[]>(`${API_BASE}/football/teams`);
  },

  async getPlayer(playerId: string): Promise<Player> {
    return fetchJson<Player>(`${API_BASE}/football/players/${encodeURIComponent(playerId)}`);
  },

  async getPlayerProfile(playerId: string): Promise<PlayerProfile> {
    return fetchJson<PlayerProfile>(`${API_BASE}/football/players/${encodeURIComponent(playerId)}/profile`);
  },

  async getNews(): Promise<NewsArticle[]> {
    return fetchJson<NewsArticle[]>(`${API_BASE}/football/news`);
  },

  async getHighlights(): Promise<HighlightItem[]> {
    return fetchJson<HighlightItem[]>(`${API_BASE}/highlights`);
  },

  async searchGlobal(query: string, category: string = 'all'): Promise<GlobalSearchResult> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category && category !== 'all') params.set('category', category);
    return fetchJson<GlobalSearchResult>(`${API_BASE}/football/search?${params.toString()}`);
  },

  async getTacticalAnalysis(fixtureId: string): Promise<TacticalAnalysis> {
    return fetchJson<TacticalAnalysis>(`${API_BASE}/ai/tactical-analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId })
    });
  },

  async getFootballIntelligence(
    fixtureId: string, 
    type: AiIntelligenceType = 'MATCH_INSIGHT', 
    playerId?: string
  ): Promise<AiFootballIntelligence> {
    return fetchJson<AiFootballIntelligence>(`${API_BASE}/ai/football-intelligence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fixtureId, type, playerId })
    });
  }
};
