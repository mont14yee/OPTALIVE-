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
import { FootballProvider, MatchesFilter, MatchesResult } from './provider.interface.js';
import {
  FootballError,
  FootballNotFoundError,
  FootballProviderError,
  FootballRateLimitError,
  FootballTimeoutError,
  sanitizeSecrets
} from './errors.js';
import { FootballNormalizer } from './normalizer.js';
import {
  RawSportmonksFixture,
  RawSportmonksLeague,
  RawSportmonksStandingRow,
  RawSportmonksTeam,
  RawSportmonksPlayer,
  RawSportmonksNews,
  SportmonksResponseEnvelope
} from './types.js';

export interface SportmonksProviderOptions {
  apiToken?: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class SportmonksProvider implements FootballProvider {
  public readonly name = 'sportmonks-v3';
  private apiToken: string | undefined;
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(options: SportmonksProviderOptions = {}) {
    this.apiToken = options.apiToken || process.env.SPORTMONKS_API_TOKEN?.trim();
    this.baseUrl = options.baseUrl || 'https://api.sportmonks.com/v3/football';
    this.timeoutMs = options.timeoutMs || 7000;
    this.maxRetries = options.maxRetries ?? 2;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken && this.apiToken.length > 5);
  }

  /**
   * Internal HTTP execution with timeout, retry, rate limit detection, and structured logging
   */
  public async executeRequest<T>(
    endpoint: string,
    params: Record<string, string | number | undefined> = {}
  ): Promise<SportmonksResponseEnvelope<T>> {
    if (!this.apiToken) {
      throw new FootballError(
        'Sportmonks API token is not configured on the server.',
        503,
        'PROVIDER_NOT_CONFIGURED'
      );
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);
    url.searchParams.set('api_token', this.apiToken);

    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        url.searchParams.set(key, String(val));
      }
    }

    let attempt = 0;
    const startTime = Date.now();

    while (attempt <= this.maxRetries) {
      attempt++;
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), this.timeoutMs);

      try {
        const sanitizedUrlDisplay = sanitizeSecrets(url.toString());
        // Structured log
        console.log(`[Sportmonks] [Attempt ${attempt}/${this.maxRetries + 1}] GET ${cleanEndpoint}`);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'OPTALIVE-Server-Provider/2.0'
          },
          signal: abortController.signal
        });

        clearTimeout(timeoutId);

        // Check Rate Limiting
        const remainingStr = response.headers.get('x-ratelimit-remaining');
        if (remainingStr !== null) {
          const remaining = parseInt(remainingStr, 10);
          if (remaining <= 2) {
            console.warn(`[Sportmonks RateLimit Warning] Only ${remaining} requests remaining!`);
          }
        }

        if (response.status === 429) {
          const retryAfter = Number(response.headers.get('retry-after') || 10);
          console.warn(`[Sportmonks RateLimit] 429 hit. Retry-After: ${retryAfter}s`);
          throw new FootballRateLimitError(
            'Sportmonks upstream rate limit reached (HTTP 429). Serving safe fallback.',
            retryAfter
          );
        }

        if (response.status === 404) {
          throw new FootballNotFoundError('Sportmonks Resource', cleanEndpoint);
        }

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          const errDetail = sanitizeSecrets(text.slice(0, 300));
          console.error(`[Sportmonks Error] HTTP ${response.status} on ${cleanEndpoint}: ${errDetail}`);

          // Retry on 5xx server errors
          if (response.status >= 500 && attempt <= this.maxRetries) {
            const backoff = Math.pow(2, attempt) * 250 + Math.random() * 100;
            console.warn(`[Sportmonks Retry] Waiting ${backoff.toFixed(0)}ms before retry...`);
            await new Promise((r) => setTimeout(r, backoff));
            continue;
          }

          throw new FootballProviderError(`Status ${response.status} from Sportmonks`, response.status, errDetail);
        }

        const data = (await response.json()) as SportmonksResponseEnvelope<T>;
        const duration = Date.now() - startTime;
        console.log(`[Sportmonks Success] ${cleanEndpoint} completed in ${duration}ms`);
        return data;
      } catch (err: unknown) {
        clearTimeout(timeoutId);

        if (err instanceof FootballError) {
          throw err;
        }

        if (err instanceof Error && err.name === 'AbortError') {
          console.error(`[Sportmonks Timeout] Timed out after ${this.timeoutMs}ms on ${cleanEndpoint}`);
          if (attempt <= this.maxRetries) {
            continue;
          }
          throw new FootballTimeoutError(cleanEndpoint, this.timeoutMs);
        }

        // Network or fetch failures
        if (attempt <= this.maxRetries) {
          const backoff = Math.pow(2, attempt) * 200;
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        throw new FootballProviderError(
          err instanceof Error ? err.message : 'Network failure communicating with Sportmonks',
          502
        );
      }
    }

    throw new FootballProviderError(`Exhausted retries for ${cleanEndpoint}`);
  }

  /**
   * GET /livescores/inplay or /livescores/latest
   * Documents: Sportmonks v3 provides /livescores/inplay and /livescores/latest
   */
  public async getLiveMatches(useLatestEndpoint = false): Promise<Fixture[]> {
    const endpoint = useLatestEndpoint ? '/livescores/latest' : '/livescores/inplay';
    const response = await this.executeRequest<RawSportmonksFixture[]>(endpoint, {
      include: 'participants;scores;periods;events.type;statistics.type;league.country;venue'
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((f) => FootballNormalizer.normalizeFixture(f));
  }

  /**
   * GET /fixtures with filters
   */
  public async getMatches(filter?: MatchesFilter): Promise<MatchesResult> {
    const endpoint = filter?.date ? `/fixtures/date/${filter.date}` : '/fixtures';
    const params: Record<string, string | number | undefined> = {
      include: 'participants;scores;periods;league.country;venue',
      page: filter?.page || 1,
      per_page: filter?.perPage || 25
    };

    if (filter?.leagueId) {
      params['filters'] = `leagueIds:${filter.leagueId}`;
    }

    const response = await this.executeRequest<RawSportmonksFixture[]>(endpoint, params);

    if (!response.data || !Array.isArray(response.data)) {
      return { fixtures: [], total: 0, page: filter?.page || 1 };
    }

    let fixtures = response.data.map((f) => FootballNormalizer.normalizeFixture(f));

    if (filter?.status && filter.status !== 'all') {
      const st = filter.status.toUpperCase();
      fixtures = fixtures.filter((m) => m.status === st || (st === 'LIVE' && m.isLive));
    }

    return {
      fixtures,
      total: response.pagination?.count || fixtures.length,
      page: response.pagination?.current_page || filter?.page || 1
    };
  }

  /**
   * GET /fixtures/{id}
   */
  public async getMatchById(id: string): Promise<Fixture> {
    const response = await this.executeRequest<RawSportmonksFixture>(`/fixtures/${id}`, {
      include: 'participants;scores;periods;events.type;statistics.type;lineups.player.position;league.country;venue'
    });

    if (!response.data) {
      throw new FootballNotFoundError('Fixture', id);
    }

    return FootballNormalizer.normalizeFixture(response.data);
  }

  /**
   * GET match events
   */
  public async getMatchEvents(id: string): Promise<MatchEvent[]> {
    const match = await this.getMatchById(id);
    return match.events || [];
  }

  /**
   * GET match statistics
   */
  public async getMatchStats(id: string): Promise<MatchStatistics> {
    const match = await this.getMatchById(id);
    if (!match.statistics) {
      throw new FootballNotFoundError('Statistics for match', id);
    }
    return match.statistics;
  }

  /**
   * GET match lineups
   */
  public async getMatchLineups(id: string): Promise<{ home: Lineup; away: Lineup }> {
    const match = await this.getMatchById(id);
    if (!match.lineups) {
      throw new FootballNotFoundError('Lineups for match', id);
    }
    return match.lineups;
  }

  /**
   * GET /leagues
   */
  public async getLeagues(): Promise<Competition[]> {
    const response = await this.executeRequest<RawSportmonksLeague[]>('/leagues', {
      include: 'country',
      per_page: 50
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((l) => FootballNormalizer.normalizeCompetition(l));
  }

  /**
   * GET /standings/seasons/{id} or /standings/live/leagues/{id}
   */
  public async getLeagueStandings(leagueId: string): Promise<LeagueStandings> {
    // Try live standings or regular standings
    let response: SportmonksResponseEnvelope<RawSportmonksStandingRow[]>;
    try {
      response = await this.executeRequest<RawSportmonksStandingRow[]>(`/standings/live/leagues/${leagueId}`, {
        include: 'participant;details.type;form'
      });
    } catch {
      response = await this.executeRequest<RawSportmonksStandingRow[]>(`/standings/seasons/${leagueId}`, {
        include: 'participant;details.type;form'
      });
    }

    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      throw new FootballNotFoundError('Standings for league', leagueId);
    }

    const competition: Competition = {
      id: String(leagueId),
      name: `League ${leagueId}`,
      shortName: `League ${leagueId}`,
      code: 'LGE',
      country: 'Global',
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg',
      colorGradient: 'from-blue-900 to-indigo-950'
    };

    return FootballNormalizer.normalizeStandings(response.data, competition);
  }

  /**
   * GET /fixtures for a league
   */
  public async getLeagueFixtures(leagueId: string, page = 1): Promise<Fixture[]> {
    const response = await this.executeRequest<RawSportmonksFixture[]>(`/fixtures`, {
      filters: `leagueIds:${leagueId}`,
      include: 'participants;scores;periods;league;venue',
      page,
      per_page: 25
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((f) => FootballNormalizer.normalizeFixture(f));
  }

  /**
   * GET /teams/{id}
   */
  public async getTeamById(teamId: string): Promise<Team> {
    const response = await this.executeRequest<RawSportmonksTeam>(`/teams/${teamId}`, {
      include: 'venue;coaches.coach'
    });

    if (!response.data) {
      throw new FootballNotFoundError('Team', teamId);
    }

    return FootballNormalizer.normalizeTeam(response.data);
  }

  /**
   * GET /players/{id}
   */
  public async getPlayerById(playerId: string): Promise<Player> {
    const response = await this.executeRequest<RawSportmonksPlayer>(`/players/${playerId}`, {
      include: 'position;nationality'
    });

    if (!response.data) {
      throw new FootballNotFoundError('Player', playerId);
    }

    return FootballNormalizer.normalizePlayer(response.data);
  }

  /**
   * GET /news
   */
  public async getNews(): Promise<NewsArticle[]> {
    try {
      const response = await this.executeRequest<RawSportmonksNews[]>('/news', {
        per_page: 20
      });

      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data.map((n) => FootballNormalizer.normalizeNews(n));
      }
    } catch (err) {
      console.warn('[Sportmonks] News endpoint not available on tier. Falling back to reference news wire.');
    }

    // Reference fallback for news if tier does not include news add-on
    const { VERIFIED_NEWS } = await import('../services/verifiedReferenceData.js');
    return VERIFIED_NEWS;
  }
}
