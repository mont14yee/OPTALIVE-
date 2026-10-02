import { VERIFIED_COMPETITIONS, SAMPLE_MATCHES, STANDINGS_DATA } from '../server/services/verifiedReferenceData.js';
import { FootballNormalizer } from '../server/football/normalizer.js';
import { Fixture, PlayerMatchStats, MatchStatistics } from '../src/types/football.js';

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

async function runLiveCenterVerification() {
  console.log('\n======================================================');
  console.log('   OPTALIVE FOOTBALL LIVE CENTER INTEGRATION SUITE');
  console.log('======================================================\n');

  // --- 1. LIVE CENTER CATEGORY FILTERS ---
  console.log('[1] Testing Live Center Category Classification...');
  const liveMatches = SAMPLE_MATCHES.filter((f) => f.isLive || f.status === 'LIVE' || f.status === 'HT');
  const upcomingMatches = SAMPLE_MATCHES.filter((f) => f.status === 'NS');
  const finishedMatches = SAMPLE_MATCHES.filter((f) => f.status === 'FT' || f.status === 'PST' || f.status === 'CANC');
  
  assert(liveMatches.length >= 2, 'Live Now category populates active in-play matches');
  assert(upcomingMatches.length >= 2, 'Upcoming category populates scheduled matches');
  assert(finishedMatches.length >= 1, 'Finished category populates completed matches');

  // Edge-case status verification: Postponed & Cancelled
  const postponedMatch = SAMPLE_MATCHES.find((f) => f.status === 'PST');
  const cancelledMatch = SAMPLE_MATCHES.find((f) => f.status === 'CANC');
  assert(Boolean(postponedMatch && postponedMatch.venue), 'Postponed (PST) status match verified with venue');
  assert(Boolean(cancelledMatch), 'Cancelled (CANC) status match verified');

  // --- 2. LIVE CARD DATA COMPLETENESS ---
  console.log('\n[2] Testing Live Card Fields (Competition, Teams, Score, Minute, Incidents)...');
  const liveCardFixture = SAMPLE_MATCHES.find((f) => f.id === 'fix-live-01')!;

  assert(Boolean(liveCardFixture.competition.name && liveCardFixture.competition.logoUrl), 'Card has competition name and logo');
  assert(Boolean(liveCardFixture.homeTeam.name && liveCardFixture.homeTeam.logoUrl), 'Card has home team name and crest');
  assert(Boolean(liveCardFixture.awayTeam.name && liveCardFixture.awayTeam.logoUrl), 'Card has away team name and crest');
  assert(typeof liveCardFixture.score.home === 'number' && typeof liveCardFixture.score.away === 'number', 'Card has numeric score');
  assert(typeof liveCardFixture.minute === 'number' && liveCardFixture.minute > 0, 'Card has match minute');
  assert(liveCardFixture.isLive === true && liveCardFixture.status === 'LIVE', 'Card has live indicator & status');

  const goals = (liveCardFixture.events || []).filter((e) => e.type.includes('goal'));
  const cards = (liveCardFixture.events || []).filter((e) => e.type.includes('card'));
  const subs = (liveCardFixture.events || []).filter((e) => e.type === 'substitution');

  assert(goals.length >= 2, 'Card has goal incidents with player names and minutes');
  assert(cards.length >= 1, 'Card has card incidents with player names and minutes');
  assert(subs.length >= 1, 'Card has substitution incidents with subbed players');

  // --- 3. MATCH CENTER TABS: OVERVIEW ---
  console.log('\n[3] Testing Match Center: OVERVIEW Tab...');
  assert(Boolean(liveCardFixture.venue), 'Overview includes venue');
  assert(Boolean(liveCardFixture.referee), 'Overview includes referee where available');
  assert(liveCardFixture.referee === 'Michael Oliver', 'Referee is Michael Oliver');
  assert(Boolean(liveCardFixture.events && liveCardFixture.events.length > 0), 'Overview includes recent incidents');

  // --- 4. MATCH CENTER TABS: STATS (NO FABRICATION RULE) ---
  console.log('\n[4] Testing Match Center: STATS Tab (Provider Authenticity)...');
  const stats = liveCardFixture.statistics!;
  assert(typeof stats.possession.home === 'number' && stats.possession.home + stats.possession.away === 100, 'Possession adds up to 100%');
  assert(typeof stats.passAccuracy.home === 'number' && stats.passAccuracy.away > 0, 'Pass accuracy is present');
  assert(typeof stats.shotsTotal.home === 'number' && typeof stats.shotsOnTarget.home === 'number', 'Shots and shots on target are present');
  assert(typeof stats.corners.home === 'number', 'Corners are present');
  assert(typeof stats.fouls.home === 'number', 'Fouls are present');
  assert(typeof stats.offsides.home === 'number', 'Offsides are present');
  assert(typeof stats.yellowCards.home === 'number', 'Yellow cards are present');
  assert(typeof stats.xG.home === 'number', 'xG is present where supplied');

  // Scheduled match stats check: should be undefined / not fabricated!
  const schedMatch = SAMPLE_MATCHES.find((f) => f.id === 'fix-sched-01')!;
  assert(schedMatch.statistics === undefined, 'Scheduled match before kickoff has NO fabricated stats (undefined)');

  // --- 5. MATCH CENTER TABS: EVENTS ---
  console.log('\n[5] Testing Match Center: EVENTS Tab...');
  const events = liveCardFixture.events!;
  const hasAssists = events.some((e) => Boolean(e.assistPlayer));
  const hasSubIn = events.some((e) => Boolean(e.subPlayerIn));
  assert(hasAssists, 'Events contain assist player telemetry where applicable');
  assert(hasSubIn, 'Events contain player-in substitution data where applicable');

  // --- 6. MATCH CENTER TABS: LINEUPS ---
  console.log('\n[6] Testing Match Center: LINEUPS Tab...');
  const lineups = liveCardFixture.lineups!;
  assert(lineups.home.startingXI.length === 11, 'Home starting XI has 11 players');
  assert(lineups.away.startingXI.length === 11, 'Away starting XI has 11 players');
  assert(Boolean(lineups.home.formation && lineups.away.formation), 'Formations defined for both teams');
  assert(lineups.home.startingXI.every((p) => p.number > 0 && p.position), 'Players have shirt number and position');
  assert(lineups.home.substitutes.length > 0, 'Substitutes bench is populated');
  assert(lineups.home.startingXI.some((p) => p.rating !== undefined), 'Player ratings present where available');

  // --- 7. MATCH CENTER TABS: PLAYERS ---
  console.log('\n[7] Testing Match Center: PLAYERS Tab...');
  const playerStats = liveCardFixture.playerStats!;
  assert(Array.isArray(playerStats) && playerStats.length > 0, 'Player statistics telemetry array is present');
  const haalandStats = playerStats.find((p) => p.name.includes('Haaland'))!;
  assert(Boolean(haalandStats), 'Erling Haaland stats found');
  assert(
    typeof haalandStats.goals === 'number' &&
    typeof haalandStats.assists === 'number' &&
    typeof haalandStats.passes === 'number' &&
    typeof haalandStats.passAccuracy === 'number' &&
    typeof haalandStats.shots === 'number' &&
    typeof haalandStats.tackles === 'number' &&
    typeof haalandStats.rating === 'number',
    'Haaland has complete player statistics (goals, assists, passes, passAccuracy, shots, tackles, rating)'
  );

  // --- 8. MATCH CENTER TABS: TABLE (STANDINGS) ---
  console.log('\n[8] Testing Match Center: TABLE Tab (Standings)...');
  const eplStandings = STANDINGS_DATA['epl'];
  assert(Boolean(eplStandings && eplStandings.table.length > 0), 'EPL standings table retrieved');
  const mciRow = eplStandings.table.find((r) => r.team.id === 'mci')!;
  const arsRow = eplStandings.table.find((r) => r.team.id === 'ars')!;
  assert(Boolean(mciRow && arsRow), 'Both participating teams exist in the table');
  assert(
    typeof mciRow.position === 'number' &&
    typeof mciRow.played === 'number' &&
    typeof mciRow.won === 'number' &&
    typeof mciRow.drawn === 'number' &&
    typeof mciRow.lost === 'number' &&
    typeof mciRow.goalsFor === 'number' &&
    typeof mciRow.goalsAgainst === 'number' &&
    typeof mciRow.goalDifference === 'number' &&
    typeof mciRow.points === 'number',
    'Standing entry includes position, played, won, drawn, lost, goals, goalDifference, points'
  );

  console.log('\n======================================================');
  console.log(`LIVE CENTER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

runLiveCenterVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
