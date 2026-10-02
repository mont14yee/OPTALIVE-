import {
  Competition,
  Fixture,
  LeagueStandings,
  MatchEvent,
  MatchStatistics,
  Lineup,
  NewsArticle,
  Team,
  Player,
  TopScorer
} from '../../src/types/football.js';

export interface MatchesFilter {
  date?: string;
  leagueId?: string;
  teamId?: string;
  team?: string;
  status?: string;
  page?: number;
  perPage?: number;
}

export interface MatchesResult {
  fixtures: Fixture[];
  total?: number;
  page?: number;
}

export interface FootballProvider {
  name: string;
  isConfigured(): boolean;

  /**
   * Fetches real-time in-play and latest updated livescores
   */
  getLiveMatches(useLatestEndpoint?: boolean): Promise<Fixture[]>;

  /**
   * Fetches matches by date / league / status
   */
  getMatches(filter?: MatchesFilter): Promise<MatchesResult>;

  /**
   * Fetches single fixture enriched with participants, scores, periods, venue
   */
  getMatchById(id: string): Promise<Fixture>;

  /**
   * Fetches events for fixture
   */
  getMatchEvents(id: string): Promise<MatchEvent[]>;

  /**
   * Fetches detailed statistics for fixture
   */
  getMatchStats(id: string): Promise<MatchStatistics>;

  /**
   * Fetches lineups and tactical formation for fixture
   */
  getMatchLineups(id: string): Promise<{ home: Lineup; away: Lineup }>;

  /**
   * Fetches competitions / leagues
   */
  getLeagues(): Promise<Competition[]>;

  /**
   * Fetches standings table for a league
   */
  getLeagueStandings(leagueId: string): Promise<LeagueStandings>;

  /**
   * Fetches upcoming/past fixtures for a specific league
   */
  getLeagueFixtures(leagueId: string, page?: number): Promise<Fixture[]>;

  /**
   * Fetches top goalscorers for a specific league
   */
  getLeagueTopScorers?(leagueId: string): Promise<TopScorer[]>;

  /**
   * Fetches all participating teams for a specific league
   */
  getLeagueTeams?(leagueId: string): Promise<Team[]>;

  /**
   * Fetches team details
   */
  getTeamById(teamId: string): Promise<Team>;

  /**
   * Fetches player details
   */
  getPlayerById(playerId: string): Promise<Player>;

  /**
   * Fetches football news articles
   */
  getNews(): Promise<NewsArticle[]>;
}
