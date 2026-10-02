import { FootballNormalizer } from '../server/football/normalizer.js';
import { FootballRepository } from '../server/football/repository.js';
import { FootballProvider, MatchesFilter, MatchesResult } from '../server/football/provider.interface.js';
import { 
  FootballRateLimitError, 
  FootballTimeoutError, 
  FootballProviderError, 
  FootballNotFoundError,
  FootballValidationError,
  sanitizeSecrets,
  formatErrorResponse 
} from '../server/football/errors.js';
import { FootballValidator } from '../server/football/validator.js';
import { FootballCache } from '../server/football/cache.js';
import { Fixture, Competition, LeagueStandings, MatchEvent, MatchStatistics, Lineup, NewsArticle, Team, Player } from '../src/types/football.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('   OPTALIVE FOOTBALL DATA LAYER VERIFICATION SUITE');
  console.log('======================================================\n');

  const BASE_URL = 'http://localhost:3000/api/football';

  // --- 1. ENDPOINT SUCCESS TESTS (HTTP Integration) ---
  console.log('[1] Testing All 12 Football Endpoints for Success...');

  try {
    // 1. Live matches
    const resLive = await fetch(`${BASE_URL}/live`);
    const liveJson = await resLive.json();
    assert(resLive.status === 200 && liveJson.success === true && Array.isArray(liveJson.data), 'GET /api/football/live returns success');

    // 2. Matches with query
    const resMatches = await fetch(`${BASE_URL}/matches?date=today`);
    const matchesJson = await resMatches.json();
    assert(resMatches.status === 200 && matchesJson.success === true && Array.isArray(matchesJson.data), 'GET /api/football/matches returns success');

    // 3. Match Details
    const resMatch = await fetch(`${BASE_URL}/matches/fix-live-01`);
    const matchJson = await resMatch.json();
    assert(resMatch.status === 200 && matchJson.success === true && matchJson.data.id === 'fix-live-01', 'GET /api/football/matches/:id returns match');

    // 4. Match Events
    const resEvents = await fetch(`${BASE_URL}/matches/fix-live-01/events`);
    const eventsJson = await resEvents.json();
    assert(resEvents.status === 200 && eventsJson.success === true && Array.isArray(eventsJson.data), 'GET /api/football/matches/:id/events returns events');

    // 5. Match Stats
    const resStats = await fetch(`${BASE_URL}/matches/fix-live-01/stats`);
    const statsJson = await resStats.json();
    assert(resStats.status === 200 && statsJson.success === true && statsJson.data.possession, 'GET /api/football/matches/:id/stats returns stats');

    // 6. Match Lineups
    const resLineups = await fetch(`${BASE_URL}/matches/fix-live-01/lineups`);
    const lineupsJson = await resLineups.json();
    assert(resLineups.status === 200 && lineupsJson.success === true && lineupsJson.data.home?.startingXI, 'GET /api/football/matches/:id/lineups returns lineups');

    // 7. Leagues
    const resLeagues = await fetch(`${BASE_URL}/leagues`);
    const leaguesJson = await resLeagues.json();
    assert(resLeagues.status === 200 && leaguesJson.success === true && Array.isArray(leaguesJson.data), 'GET /api/football/leagues returns leagues');

    // 8. League Standings
    const resStandings = await fetch(`${BASE_URL}/leagues/epl/standings`);
    const standingsJson = await resStandings.json();
    assert(resStandings.status === 200 && standingsJson.success === true && Array.isArray(standingsJson.data.table), 'GET /api/football/leagues/:id/standings returns standings table');

    // 9. League Fixtures
    const resLeagueFixtures = await fetch(`${BASE_URL}/leagues/epl/fixtures`);
    const lFixJson = await resLeagueFixtures.json();
    assert(resLeagueFixtures.status === 200 && lFixJson.success === true && Array.isArray(lFixJson.data), 'GET /api/football/leagues/:id/fixtures returns fixtures');

    // 10. Teams
    const resTeam = await fetch(`${BASE_URL}/teams/mci`);
    const teamJson = await resTeam.json();
    assert(resTeam.status === 200 && teamJson.success === true && teamJson.data.name === 'Manchester City', 'GET /api/football/teams/:id returns team');

    // 11. Players
    const resPlayer = await fetch(`${BASE_URL}/players/p-haaland`);
    const playerJson = await resPlayer.json();
    assert(resPlayer.status === 200 && playerJson.success === true && playerJson.data.name.includes('Haaland'), 'GET /api/football/players/:id returns player');

    // 12. News
    const resNews = await fetch(`${BASE_URL}/news`);
    const newsJson = await resNews.json();
    assert(resNews.status === 200 && newsJson.success === true && Array.isArray(newsJson.data), 'GET /api/football/news returns news');
  } catch (err) {
    assert(false, 'HTTP Integration Tests', String(err));
  }

  // --- 2. MATCH STATUS CLASSIFICATION TESTS ---
  console.log('\n[2] Testing Match States (Live, Scheduled, Finished)...');
  try {
    // Live match
    const liveMatchRes = await fetch(`${BASE_URL}/matches/fix-live-01`);
    const liveMatch = (await liveMatchRes.json()).data;
    assert(liveMatch.status === 'LIVE' && liveMatch.isLive === true && liveMatch.minute > 0, 'Live match state verified (status LIVE, minute > 0)');

    // Scheduled match
    const schedMatchRes = await fetch(`${BASE_URL}/matches/fix-sched-01`);
    const schedMatch = (await schedMatchRes.json()).data;
    assert(schedMatch.status === 'NS' && schedMatch.isLive === false, 'Scheduled match state verified (status NS, isLive false)');

    // Finished match
    const pastMatchRes = await fetch(`${BASE_URL}/matches/fix-past-01`);
    const pastMatch = (await pastMatchRes.json()).data;
    assert(pastMatch.status === 'FT' && pastMatch.isLive === false && pastMatch.score.fullTime, 'Finished match state verified (status FT, fullTime score present)');
  } catch (err) {
    assert(false, 'Match States Tests', String(err));
  }

  // --- 3. EMPTY RESPONSE HANDLING ---
  console.log('\n[3] Testing Empty Response Handling...');
  try {
    const resEmpty = await fetch(`${BASE_URL}/matches?league_id=non-existent-league`);
    const jsonEmpty = await resEmpty.json();
    assert(resEmpty.status === 200 && jsonEmpty.success === true && jsonEmpty.data.length === 0, 'Empty search returns 200 OK with empty array []');
  } catch (err) {
    assert(false, 'Empty Response Handling', String(err));
  }

  // --- 4. REQUEST VALIDATION & MALFORMED INPUTS ---
  console.log('\n[4] Testing Request Validation & Malformed Inputs...');
  try {
    // Invalid ID characters
    const resBadId = await fetch(`${BASE_URL}/matches/bad$<invalid>`);
    const jsonBadId = await resBadId.json();
    assert(resBadId.status === 400 && jsonBadId.error.code === 'VALIDATION_ERROR', 'Special characters in ID returns 400 VALIDATION_ERROR');

    // Invalid date format
    const resBadDate = await fetch(`${BASE_URL}/matches?date=23-09-2026`);
    const jsonBadDate = await resBadDate.json();
    assert(resBadDate.status === 400 && jsonBadDate.error.code === 'VALIDATION_ERROR', 'Non-ISO date returns 400 VALIDATION_ERROR');

    // Invalid page
    const resBadPage = await fetch(`${BASE_URL}/matches?page=-1`);
    const jsonBadPage = await resBadPage.json();
    assert(resBadPage.status === 400 && jsonBadPage.error.code === 'VALIDATION_ERROR', 'Negative page returns 400 VALIDATION_ERROR');

    // Invalid status filter
    const resBadStatus = await fetch(`${BASE_URL}/matches?status=superbowl`);
    const jsonBadStatus = await resBadStatus.json();
    assert(resBadStatus.status === 400 && jsonBadStatus.error.code === 'VALIDATION_ERROR', 'Invalid status returns 400 VALIDATION_ERROR');
  } catch (err) {
    assert(false, 'Validation Tests', String(err));
  }

  // --- 5. UNAVAILABLE RESOURCES ---
  console.log('\n[5] Testing Unavailable Resources (404 Handling)...');
  try {
    // Non-existent match
    const resNoMatch = await fetch(`${BASE_URL}/matches/fix-999999`);
    const jsonNoMatch = await resNoMatch.json();
    assert(resNoMatch.status === 404 && jsonNoMatch.error.code === 'RESOURCE_NOT_FOUND', 'Unavailable match returns 404 RESOURCE_NOT_FOUND');

    // Unavailable league
    const resNoLeague = await fetch(`${BASE_URL}/leagues/league-xyz-99/standings`);
    const jsonNoLeague = await resNoLeague.json();
    assert(resNoLeague.status === 404 && jsonNoLeague.error.code === 'RESOURCE_NOT_FOUND', 'Unavailable league standings returns 404 RESOURCE_NOT_FOUND');

    // Unavailable statistics (e.g. for scheduled match before kickoff)
    const resNoStats = await fetch(`${BASE_URL}/matches/fix-sched-01/stats`);
    const jsonNoStats = await resNoStats.json();
    assert(resNoStats.status === 404 && jsonNoStats.error.code === 'RESOURCE_NOT_FOUND', 'Unavailable stats before kickoff returns 404 RESOURCE_NOT_FOUND');

    // Unavailable lineup (e.g. for scheduled match without published squads)
    const resNoLineup = await fetch(`${BASE_URL}/matches/fix-sched-01/lineups`);
    const jsonNoLineup = await resNoLineup.json();
    assert(resNoLineup.status === 404 && jsonNoLineup.error.code === 'RESOURCE_NOT_FOUND', 'Unavailable lineup returns 404 RESOURCE_NOT_FOUND');
  } catch (err) {
    assert(false, 'Unavailable Resources Tests', String(err));
  }

  // --- 6. MALFORMED DATA & MISSING OPTIONAL FIELDS (NORMALIZER DEFENSE) ---
  console.log('\n[6] Testing Normalizer Robustness with Malformed / Partial Data...');
  try {
    // Completely empty raw object
    const normalizedEmpty = FootballNormalizer.normalizeFixture({ id: 888 } as any);
    assert(normalizedEmpty.id === '888', 'Normalizer handles completely empty fixture object without throwing');
    assert(normalizedEmpty.homeTeam.name === 'Home Club', 'Normalizer supplies safe default homeTeam name');
    assert(normalizedEmpty.score.home === 0 && normalizedEmpty.score.away === 0, 'Normalizer defaults missing scores to 0');
    assert(normalizedEmpty.status === 'NS', 'Normalizer maps missing status to NS');

    // Missing statistics fields
    const statsPartial = FootballNormalizer.normalizeStatistics(123, '1', '2', [
      { type: { developer_name: 'possession' }, data: { value: 62 }, participant_id: 1 } as any
    ]);
    assert(statsPartial.possession.home === 62 && statsPartial.possession.away === 50, 'Partial statistics normalized properly with defaults for missing keys');

    // Missing lineups
    const lineupsEmpty = FootballNormalizer.normalizeLineups([], '1', '2');
    assert(lineupsEmpty.home.startingXI.length === 0 && lineupsEmpty.away.startingXI.length === 0, 'Empty lineups array normalized into valid startingXI & substitutes arrays');
  } catch (err) {
    assert(false, 'Normalizer Robustness Tests', String(err));
  }

  // --- 7. PROVIDER ERROR, TIMEOUT, RATE LIMIT & STALE-CACHE RESILIENCE ---
  console.log('\n[7] Testing Provider Error, Timeout, Rate-Limit & Stale Resilience...');
  try {
    const testCache = new FootballCache();

    // Mock Provider that throws RateLimitError
    const mockRateLimitProvider: FootballProvider = {
      name: 'mock-ratelimit-provider',
      isConfigured: () => true,
      getLiveMatches: async () => { throw new FootballRateLimitError('Rate limit hit 429', 15); },
      getMatches: async () => { throw new FootballRateLimitError(); },
      getMatchById: async () => { throw new FootballRateLimitError(); },
      getMatchEvents: async () => { throw new FootballRateLimitError(); },
      getMatchStats: async () => { throw new FootballRateLimitError(); },
      getMatchLineups: async () => { throw new FootballRateLimitError(); },
      getLeagues: async () => { throw new FootballRateLimitError(); },
      getLeagueStandings: async () => { throw new FootballRateLimitError(); },
      getLeagueFixtures: async () => { throw new FootballRateLimitError(); },
      getTeamById: async () => { throw new FootballRateLimitError(); },
      getPlayerById: async () => { throw new FootballRateLimitError(); },
      getNews: async () => { throw new FootballRateLimitError(); }
    };

    // Pre-populate stale cache
    const testFixture: Fixture = {
      id: 'cached-01',
      competition: { id: 'c1', name: 'Test', shortName: 'T', code: 'T', country: 'T', logoUrl: '', colorGradient: '' },
      homeTeam: { id: 'h1', name: 'Home', shortName: 'H', code: 'H', logoUrl: '' },
      awayTeam: { id: 'a1', name: 'Away', shortName: 'A', code: 'A', logoUrl: '' },
      status: 'LIVE',
      score: { home: 1, away: 0 },
      isLive: true,
      startingAt: new Date().toISOString(),
      venue: 'Test'
    };

    // Set cache item with 1ms TTL so it becomes stale immediately
    testCache.set('matches:live:inplay', [testFixture], 1, 60000);
    await new Promise((r) => setTimeout(r, 10)); // wait 10ms

    // Test Repository with rate-limited provider: should detect stale cache and return it with isStale: true
    const repoWithStale = new FootballRepository({
      primaryProvider: mockRateLimitProvider,
      cache: testCache
    });

    const liveRes = await repoWithStale.getLiveMatches();
    assert(liveRes.isStale === true, 'Repository serves STALE cache when provider is rate-limited (isStale = true)');
    assert(liveRes.source === 'stale-cache', 'Source marked as stale-cache');
    assert(liveRes.data[0].id === 'cached-01', 'Stale cache payload preserved accurately');

    // Test Timeout Error wrapping
    const timeoutErr = new FootballTimeoutError('/livescores/inplay', 5000);
    const { statusCode: timeoutCode, body: timeoutBody } = formatErrorResponse(timeoutErr);
    assert(timeoutCode === 504 && timeoutBody.error.code === 'GATEWAY_TIMEOUT', 'Timeout formats as 504 GATEWAY_TIMEOUT');

    // Test Provider Error wrapping
    const providerErr = new FootballProviderError('Upstream server broken', 500);
    const { statusCode: providerCode, body: providerBody } = formatErrorResponse(providerErr);
    assert(providerCode === 502 && providerBody.error.code === 'PROVIDER_ERROR', 'Provider error formats as 502 PROVIDER_ERROR');

    // Test Secret Sanitization
    process.env.SPORTMONKS_API_TOKEN = 'secret-token-xyz-123456';
    const textWithSecret = 'Error contacting https://api.sportmonks.com/v3/football/leagues?api_token=secret-token-xyz-123456 with Bearer secret-token-xyz-123456';
    const sanitized = sanitizeSecrets(textWithSecret);
    assert(!sanitized.includes('secret-token-xyz-123456'), 'Secret sanitization completely removes API tokens from error strings');
    assert(sanitized.includes('[REDACTED'), 'Secret replaced with [REDACTED]');

    // Clean up
    testCache.destroy();
  } catch (err) {
    assert(false, 'Resilience & Error Tests', String(err));
  }

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
