import {
  Competition,
  Fixture,
  LeagueStandings,
  MatchEvent,
  MatchStatistics,
  Lineup,
  NewsArticle,
  HighlightItem,
  Team,
  Player,
  TopScorer
} from '../../src/types/football.js';
import { FootballProvider, MatchesFilter, MatchesResult } from './provider.interface.js';
import { SportmonksProvider } from './sportmonks.provider.js';
import { ReferenceProvider } from './reference.provider.js';
import { FootballCache, footballCache } from './cache.js';
import { RepositoryResult } from './types.js';
import { FootballRateLimitError, FootballTimeoutError, FootballProviderError } from './errors.js';

export interface RepositoryOptions {
  primaryProvider?: FootballProvider;
  fallbackProvider?: FootballProvider;
  cache?: FootballCache;
}

export class FootballRepository {
  private primaryProvider: FootballProvider;
  private fallbackProvider: FootballProvider;
  private cache: FootballCache;

  constructor(options: RepositoryOptions | FootballProvider = {}) {
    if ('isConfigured' in options) {
      this.primaryProvider = options;
      this.fallbackProvider = new ReferenceProvider();
      this.cache = footballCache;
    } else {
      this.primaryProvider = options.primaryProvider || new SportmonksProvider();
      this.fallbackProvider = options.fallbackProvider || new ReferenceProvider();
      this.cache = options.cache || footballCache;
    }

    console.log(
      `[FootballRepository] Initialized with primary provider '${this.primaryProvider.name}' (configured: ${this.primaryProvider.isConfigured()}) and fallback provider '${this.fallbackProvider.name}'.`
    );
  }

  public getActiveProviderName(): string {
    return this.primaryProvider.isConfigured() ? this.primaryProvider.name : this.fallbackProvider.name;
  }

  public isSportmonksConfigured(): boolean {
    return this.primaryProvider.isConfigured();
  }

  /**
   * Helper that executes a cached read with stale detection and resilient fallback
   */
  private async executeWithCache<T>(
    cacheKey: string,
    ttlMs: number,
    fetchFn: (provider: FootballProvider) => Promise<T>,
    staleTtlMs?: number
  ): Promise<RepositoryResult<T>> {
    // 1. Check cache first
    const cached = this.cache.get<T>(cacheKey);
    if (cached && !cached.isStale) {
      return {
        data: cached.data,
        isStale: false,
        cachedAt: cached.cachedAt,
        source: this.primaryProvider.isConfigured() ? 'live-sportmonks' : 'verified-reference'
      };
    }

    // 2. Determine which provider to call
    const providerToUse = this.primaryProvider.isConfigured()
      ? this.primaryProvider
      : this.fallbackProvider;

    try {
      const freshData = await fetchFn(providerToUse);
      this.cache.set(cacheKey, freshData, ttlMs, staleTtlMs);
      return {
        data: freshData,
        isStale: false,
        cachedAt: new Date().toISOString(),
        source: providerToUse.name === 'sportmonks-v3' ? 'live-sportmonks' : 'verified-reference'
      };
    } catch (err: unknown) {
      console.warn(`[FootballRepository] Provider fetch failed for '${cacheKey}':`, err instanceof Error ? err.message : err);

      // 3. Resilience: If we have a stale cached version, return it with isStale: true
      if (cached) {
        console.warn(`[FootballRepository] Serving STALE cached data for key '${cacheKey}' due to provider error.`);
        return {
          data: cached.data,
          isStale: true,
          cachedAt: cached.cachedAt,
          source: 'stale-cache'
        };
      }

      // 4. If primary provider failed and fallback provider is available, try fallback
      if (providerToUse !== this.fallbackProvider) {
        try {
          console.warn(`[FootballRepository] Attempting fallback provider for '${cacheKey}'...`);
          const fallbackData = await fetchFn(this.fallbackProvider);
          this.cache.set(cacheKey, fallbackData, ttlMs, staleTtlMs);
          return {
            data: fallbackData,
            isStale: false,
            cachedAt: new Date().toISOString(),
            source: 'verified-reference'
          };
        } catch (fallbackErr) {
          console.error(`[FootballRepository] Fallback provider also failed for '${cacheKey}':`, fallbackErr);
        }
      }

      // Re-throw if no stale cache or fallback could satisfy the request
      throw err;
    }
  }

  public async getLiveMatches(useLatest = false): Promise<RepositoryResult<Fixture[]>> {
    const key = `matches:live:${useLatest ? 'latest' : 'inplay'}`;
    // 12s fresh TTL, 60s stale tolerance for fast-moving livescores
    return this.executeWithCache(key, 12000, (p) => p.getLiveMatches(useLatest), 60000);
  }

  public async getMatches(filter?: MatchesFilter): Promise<RepositoryResult<Fixture[]>> {
    const dateKey = filter?.date || 'today';
    const leagueKey = filter?.leagueId || 'all';
    const teamKey = filter?.teamId || filter?.team || 'all';
    const statusKey = filter?.status || 'all';
    const pageKey = filter?.page || 1;
    const key = `matches:${dateKey}:${leagueKey}:${teamKey}:${statusKey}:${pageKey}`;

    const res = await this.executeWithCache<MatchesResult>(
      key,
      60000, // 60s fresh TTL
      (p) => p.getMatches(filter),
      300000
    );

    return {
      data: res.data.fixtures,
      isStale: res.isStale,
      cachedAt: res.cachedAt,
      source: res.source,
      total: res.data.total,
      page: res.data.page
    };
  }

  public async getMatchById(id: string): Promise<RepositoryResult<Fixture>> {
    const key = `match:${id}`;
    // 15s for live matches, 1hr for finished
    return this.executeWithCache(
      key,
      30000,
      async (p) => {
        const fixture = await p.getMatchById(id);
        return fixture;
      },
      300000
    );
  }

  public async getMatchEvents(id: string): Promise<RepositoryResult<MatchEvent[]>> {
    const key = `match:${id}:events`;
    return this.executeWithCache(key, 20000, (p) => p.getMatchEvents(id), 120000);
  }

  public async getMatchStats(id: string): Promise<RepositoryResult<MatchStatistics>> {
    const key = `match:${id}:stats`;
    return this.executeWithCache(key, 20000, (p) => p.getMatchStats(id), 120000);
  }

  public async getMatchLineups(id: string): Promise<RepositoryResult<{ home: Lineup; away: Lineup }>> {
    const key = `match:${id}:lineups`;
    return this.executeWithCache(key, 60000, (p) => p.getMatchLineups(id), 600000);
  }

  public async getLeagues(): Promise<RepositoryResult<Competition[]>> {
    const key = 'leagues:all';
    // 1 hour fresh TTL
    return this.executeWithCache(key, 3600000, (p) => p.getLeagues(), 86400000);
  }

  public async getLeagueStandings(leagueId: string): Promise<RepositoryResult<LeagueStandings>> {
    const key = `league:${leagueId}:standings`;
    // 15 minutes fresh TTL
    return this.executeWithCache(key, 900000, (p) => p.getLeagueStandings(leagueId), 3600000);
  }

  public async getLeagueTopScorers(leagueId: string): Promise<RepositoryResult<TopScorer[]>> {
    const key = `league:${leagueId}:topscorers`;
    return this.executeWithCache(
      key,
      1800000,
      async (p) => {
        if (p.getLeagueTopScorers) return p.getLeagueTopScorers(leagueId);
        return [];
      },
      86400000
    );
  }

  public async getLeagueTeams(leagueId: string): Promise<RepositoryResult<Team[]>> {
    const key = `league:${leagueId}:teams`;
    return this.executeWithCache(
      key,
      3600000,
      async (p) => {
        if (p.getLeagueTeams) return p.getLeagueTeams(leagueId);
        try {
          const st = await p.getLeagueStandings(leagueId);
          return st.table.map((r) => r.team);
        } catch {
          return [];
        }
      },
      86400000
    );
  }

  public async getLeagueFixtures(leagueId: string, page = 1): Promise<RepositoryResult<Fixture[]>> {
    const key = `league:${leagueId}:fixtures:${page}`;
    // 5 minutes fresh TTL
    return this.executeWithCache(key, 300000, (p) => p.getLeagueFixtures(leagueId, page), 1800000);
  }

  public async getTeamById(teamId: string): Promise<RepositoryResult<Team>> {
    const key = `team:${teamId}`;
    // 2 hours fresh TTL
    return this.executeWithCache(key, 7200000, (p) => p.getTeamById(teamId), 86400000);
  }

  public async getPlayerById(playerId: string): Promise<Player> {
    const key = `player:${playerId}`;
    const res = await this.executeWithCache(key, 7200000, (p) => p.getPlayerById(playerId), 86400000);
    return res.data;
  }

  public async getNews(): Promise<RepositoryResult<NewsArticle[]>> {
    const key = 'news:global';
    // 10 minutes fresh TTL
    return this.executeWithCache(key, 600000, (p) => p.getNews(), 3600000);
  }

  public async getHighlights(): Promise<RepositoryResult<HighlightItem[]>> {
    const key = 'highlights:global';
    return this.executeWithCache(key, 600000, async () => {
      const { VERIFIED_HIGHLIGHTS } = await import('../services/verifiedReferenceData.js');
      return VERIFIED_HIGHLIGHTS;
    }, 3600000);
  }

  public clearCache(): void {
    this.cache.clear();
  }
}

export const footballRepository = new FootballRepository();
