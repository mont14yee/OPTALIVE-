/**
 * Normalized Internal Football Data Model for OPTALIVE
 * Decouples the UI completely from external data providers (Sportmonks / Opta / etc.)
 */

export type MatchStatus = 
  | 'NS'     // Not Started
  | 'LIVE'   // In Play (1st half, 2nd half)
  | 'HT'     // Half Time
  | 'FT'     // Full Time
  | 'AET'    // After Extra Time
  | 'PEN'    // Penalty Shootout
  | 'PST'    // Postponed
  | 'CANC'   // Cancelled
  | 'SUSP';  // Suspended

export interface Competition {
  id: string;
  name: string;
  shortName: string;
  code: string;
  country: string;
  logoUrl: string;
  colorGradient: string;
  season?: string;
  isPopular?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logoUrl: string;
  country?: string;
  founded?: number;
  stadium?: string;
  manager?: string;
}

export interface Player {
  id: string;
  name: string;
  shortName: string;
  position: 'GK' | 'DF' | 'MF' | 'FW' | 'SUB';
  number: number;
  photoUrl?: string;
  nationality?: string;
  rating?: number;
  captain?: boolean;
}

export interface PlayerInLineup extends Player {
  grid?: string; // e.g. "3:2" or coordinates
  formationIndex?: number;
}

export interface Lineup {
  teamId: string;
  formation: string; // e.g. "4-3-3", "4-2-3-1"
  startingXI: PlayerInLineup[];
  substitutes: PlayerInLineup[];
  coach?: {
    name: string;
    photoUrl?: string;
  };
}

export type MatchEventType = 
  | 'goal' 
  | 'penalty_goal' 
  | 'own_goal' 
  | 'missed_penalty' 
  | 'yellow_card' 
  | 'red_card' 
  | 'substitution' 
  | 'var' 
  | 'woodwork';

export interface MatchEvent {
  id: string;
  fixtureId: string;
  minute: number;
  extraMinute?: number;
  type: MatchEventType;
  teamId: string;
  player: {
    id: string;
    name: string;
  };
  assistPlayer?: {
    id: string;
    name: string;
  };
  subPlayerIn?: {
    id: string;
    name: string;
  };
  detail?: string;
}

export interface MatchStatistics {
  fixtureId: string;
  possession: { home: number; away: number }; // percentage
  xG: { home: number; away: number };
  shotsTotal: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  shotsOffTarget: { home: number; away: number };
  blockedShots: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  bigChancesCreated: { home: number; away: number };
  passesTotal: { home: number; away: number };
  passAccuracy: { home: number; away: number }; // percentage
  attacks: { home: number; away: number };
  dangerousAttacks: { home: number; away: number };
  saves: { home: number; away: number };
}

export interface PlayerMatchStats {
  playerId: string;
  name: string;
  teamId: string;
  position: 'GK' | 'DF' | 'MF' | 'FW' | 'SUB';
  number: number;
  photoUrl?: string;
  rating?: number;
  goals: number;
  assists: number;
  shots: number;
  shotsOnTarget?: number;
  passes: number;
  passAccuracy: number; // percentage
  tackles: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed?: number;
}

export interface Fixture {
  id: string;
  competition: Competition;
  round?: string;
  homeTeam: Team;
  awayTeam: Team;
  status: MatchStatus;
  minute?: number;
  extraMinute?: number;
  startingAt: string; // ISO 8601 string
  venue: string;
  referee?: string;
  score: {
    home: number;
    away: number;
    halfTime?: { home: number; away: number };
    fullTime?: { home: number; away: number };
    penalties?: { home: number; away: number };
  };
  events?: MatchEvent[];
  statistics?: MatchStatistics;
  lineups?: {
    home: Lineup;
    away: Lineup;
  };
  playerStats?: PlayerMatchStats[];
  isLive: boolean;
  momentum?: {
    minute: number;
    value: number; // positive = home pressure, negative = away pressure
  }[];
}

export interface StandingEntry {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
  zone?: 'ucl' | 'uel' | 'uecl' | 'relegation' | 'promotion' | 'neutral';
}

export interface LeagueStandings {
  competition: Competition;
  season: string;
  table: StandingEntry[];
}

export interface TopScorer {
  position: number;
  player: Player;
  team: Team;
  appearances: number;
  goals: number;
  assists?: number;
  penalties?: number;
  minutesPlayed?: number;
}

export type NewsSection = 'latest' | 'match_news' | 'transfer_news' | 'league_news' | 'team_news' | 'highlights';

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl: string;
  category: 'transfer' | 'injury' | 'tactical' | 'breaking' | 'general' | 'match' | 'league' | 'team';
  section?: NewsSection;
  competition?: {
    id: string;
    name: string;
    shortName?: string;
    logoUrl?: string;
  };
  relatedTeam?: string;
  relatedTeamId?: string;
  relatedFixtureId?: string;
  relatedPlayer?: string;
  readTimeMinutes?: number;
  contentParagraphs?: string[];
  keyTakeaways?: string[];
  verifiedAttribution?: boolean;
}

export interface HighlightItem {
  id: string;
  title: string;
  fixtureId?: string;
  matchDescription: string;
  competition: string;
  competitionId?: string;
  score: string;
  duration: string;
  thumbnail: string;
  videoUrl?: string;
  provider: string;
  isOfficialSource: boolean;
  videoAvailable: boolean;
  publishedAt: string;
  keyMoment: string;
  relatedTeams?: { home: string; away: string };
}

export interface TacticalAnalysis {
  fixtureId: string;
  matchSummary: string;
  keyNarrative: string;
  tacticalAdvantage: {
    dominantTeam: string;
    explanation: string;
  };
  keyPlayerToWatch: {
    name: string;
    team: string;
    reason: string;
  };
  predictedTacticalShift: string;
  momentumVerdict: string;
  source: 'gemini' | 'statistical_model';
  generatedAt: string;
}

export interface ApiStatus {
  sportmonksConfigured: boolean;
  geminiConfigured: boolean;
  dataSource: 'live-sportmonks' | 'verified-reference';
  lastSync: string;
  activeLiveMatchesCount: number;
}

export interface ApiMeta {
  total?: number;
  count?: number;
  page?: number;
  isStale?: boolean;
  cachedAt?: string;
  cacheExpiresAt?: string;
  provider?: string;
  timestamp?: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
  };
}

export interface TeamStats {
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  cleanSheets: number;
  possession?: number | null; // e.g. 64.2% or null if unavailable
  passesTotal?: number | null; // e.g. 18450 or null
  passAccuracy?: number | null; // e.g. 89.2% or null
  form: ('W' | 'D' | 'L')[];
  winRate: number; // percentage
  points?: number;
  position?: number;
}

export interface PlayerProfileItem extends Player {
  teamId?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
  rating?: number;
}

export interface TeamProfile {
  team: Team;
  competition: Competition;
  stats: TeamStats;
  standings?: LeagueStandings;
  fixtures: Fixture[];
  results: Fixture[];
  squad: PlayerProfileItem[];
  news: NewsArticle[];
}

export interface PlayerStats {
  appearances: number | null;
  starts: number | null;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  shots: number | null;
  passes: number | null;
  passAccuracy: number | null;
  tackles: number | null;
  interceptions: number | null; // Graceful "Not available" if not tracked!
  yellowCards: number | null;
  redCards: number | null;
  rating: number | null;
}

export interface PlayerMatchPerformance {
  fixtureId: string;
  date: string;
  competition: string;
  opponent: Team;
  isHome: boolean;
  score: { home: number; away: number };
  result: 'W' | 'D' | 'L';
  rating?: number | null;
  minutesPlayed?: number | null;
  goals?: number | null;
  assists?: number | null;
  shots?: number | null;
  passes?: number | null;
  passAccuracy?: number | null;
  tackles?: number | null;
  interceptions?: number | null;
  yellowCards?: number | null;
  redCards?: number | null;
}

export interface PlayerProfile {
  player: Player;
  team: Team;
  competition: Competition;
  stats: PlayerStats;
  matches: PlayerMatchPerformance[];
  form: {
    recentRatings: { match: string; opponent: string; rating: number | null; date: string }[];
    averageRating: number | null;
    formTrend: 'improving' | 'steady' | 'declining' | 'unavailable';
  };
}

export interface SearchPlayerItem extends Player {
  teamName?: string;
  teamId?: string;
  appearances?: number;
  goals?: number;
  assists?: number;
}

export interface GlobalSearchResult {
  teams: Team[];
  players: SearchPlayerItem[];
  competitions: Competition[];
  fixtures: Fixture[];
}

export interface UserPreferences {
  favouriteTeamIds: string[];
  favouriteLeagueIds: string[];
  favouritePlayerIds: string[];
  recentSearches: string[];
  prioritizeFavoritesOnHome: boolean;
}

export type AiIntelligenceType = 
  | 'MATCH_INSIGHT' 
  | 'TEAM_FORM_ANALYSIS' 
  | 'PLAYER_PERFORMANCE_SUMMARY' 
  | 'POST_MATCH_SUMMARY';

export interface CalculatedMetric {
  label: string;
  value: string | number;
  note?: string;
  trend?: 'positive' | 'negative' | 'neutral';
}

export interface ImportantEventImpact {
  minute: number;
  type?: string;
  description: string;
  impact: string;
}

export interface AiFootballIntelligence {
  type: AiIntelligenceType;
  fixtureId: string;
  matchTitle: string;
  summary: string;
  key_facts: string[];
  calculated_metrics: CalculatedMetric[];
  performance_notes: string[];
  important_events: ImportantEventImpact[];
  data_limitations: string[];
  disclaimer: string;
  generatedAt: string;
  source: 'gemini' | 'grounded_rules_engine';
}


