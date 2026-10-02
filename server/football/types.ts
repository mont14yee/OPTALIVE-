import { 
  Competition, 
  Fixture, 
  LeagueStandings, 
  MatchEvent, 
  MatchStatistics, 
  Lineup, 
  NewsArticle, 
  Team, 
  Player 
} from '../../src/types/football.js';

export interface SportmonksResponseEnvelope<T> {
  data: T;
  pagination?: {
    count: number;
    per_page: number;
    current_page: number;
    next_page: string | null;
    has_more: boolean;
  };
  rate_limit?: {
    remaining: number;
    requested_at: string;
    resets_in_seconds: number;
  };
  message?: string;
  errors?: Record<string, string[]>;
}

// Raw Sportmonks v3 Entities
export interface RawSportmonksParticipant {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
  meta?: {
    location?: 'home' | 'away';
    winner?: boolean | null;
    position?: number;
  };
}

export interface RawSportmonksScore {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  participant_id?: number;
  score?: {
    goals?: number;
    participant?: 'home' | 'away';
  };
  description?: string;
}

export interface RawSportmonksPeriod {
  id?: number;
  period?: string;
  minutes?: number;
  seconds?: number;
  has_timer?: boolean;
}

export interface RawSportmonksEvent {
  id: number;
  fixture_id?: number;
  period_id?: number;
  participant_id?: number;
  type_id?: number;
  section?: string;
  type?: {
    id?: number;
    name?: string;
    code?: string;
    developer_name?: string;
  };
  player_id?: number;
  player_name?: string;
  related_player_id?: number;
  related_player_name?: string;
  minute?: number;
  extra_minute?: number;
  addition?: string;
  result?: string;
}

export interface RawSportmonksStatistic {
  id?: number;
  fixture_id?: number;
  type_id?: number;
  participant_id?: number;
  type?: {
    id?: number;
    name?: string;
    code?: string;
    developer_name?: string;
  };
  data?: {
    value?: number | string | null;
  };
  value?: number | string | null;
}

export interface RawSportmonksLineup {
  id?: number;
  fixture_id?: number;
  player_id?: number;
  player_name?: string;
  team_id?: number;
  type_id?: number; // 11 = starting, 12 = bench
  formation_position?: number;
  formation_field?: string;
  jersey_number?: number;
  position_id?: number;
  player?: {
    id?: number;
    common_name?: string;
    display_name?: string;
    image_path?: string;
    position?: {
      code?: string;
      name?: string;
    };
  };
}

export interface RawSportmonksFixture {
  id: number;
  sport_id?: number;
  league_id?: number;
  season_id?: number;
  stage_id?: number;
  group_id?: number;
  round_id?: number;
  state_id?: number;
  venue_id?: number;
  name?: string;
  starting_at?: string;
  result_info?: string;
  leg?: string;
  length?: number;
  participants?: RawSportmonksParticipant[];
  scores?: RawSportmonksScore[];
  periods?: RawSportmonksPeriod[];
  events?: RawSportmonksEvent[];
  statistics?: RawSportmonksStatistic[];
  lineups?: RawSportmonksLineup[];
  league?: {
    id: number;
    name: string;
    code?: string;
    image_path?: string;
    country?: { name: string };
  };
  venue?: {
    name?: string;
    city_name?: string;
    capacity?: number;
  };
}

export interface RawSportmonksLeague {
  id: number;
  name: string;
  code?: string;
  image_path?: string;
  country?: {
    name?: string;
  };
  current_season_id?: number;
}

export interface RawSportmonksStandingRow {
  position?: number;
  participant_id?: number;
  points?: number;
  result?: string;
  participant?: {
    id: number;
    name: string;
    short_code?: string;
    image_path?: string;
  };
  details?: Array<{
    type?: {
      developer_name?: string;
      code?: string;
    };
    value?: number;
  }>;
  form?: Array<{
    form?: string;
    result?: string;
  }>;
}

export interface RawSportmonksTeam {
  id: number;
  name: string;
  short_code?: string;
  image_path?: string;
  founded?: number;
  venue?: {
    name?: string;
    capacity?: number;
  };
  coaches?: Array<{
    coach?: {
      display_name?: string;
      image_path?: string;
    };
  }>;
}

export interface RawSportmonksPlayer {
  id: number;
  display_name?: string;
  common_name?: string;
  firstname?: string;
  lastname?: string;
  image_path?: string;
  nationality?: {
    name?: string;
  };
  position?: {
    code?: string;
    name?: string;
  };
}

export interface RawSportmonksNews {
  id: number;
  title: string;
  description?: string;
  summary?: string;
  url?: string;
  image_path?: string;
  source?: string;
  published_at?: string;
  category?: string;
}

export interface RepositoryResult<T> {
  data: T;
  isStale: boolean;
  cachedAt: string;
  source: 'live-sportmonks' | 'verified-reference' | 'stale-cache';
  total?: number;
  page?: number;
}
