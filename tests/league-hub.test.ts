import { FootballRepository } from '../server/football/repository.js';
import { ReferenceProvider } from '../server/football/reference.provider.js';

async function runLeagueHubTests() {
  console.log('--- STARTING LEAGUE HUB TESTS ---');
  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
      failed++;
    }
  };

  const provider = new ReferenceProvider();
  const repo = new FootballRepository(provider);

  // 1. Verify Leagues List includes all Priority Competitions
  const leaguesRes = await repo.getLeagues();
  const leagues = leaguesRes.data;
  assert(leagues.length >= 7, `Leagues count is ${leagues.length} (>= 7)`);

  const priorityCompetitions = [
    'epl',
    'laliga',
    'seriea',
    'bundesliga',
    'ligue1',
    'ucl',
    'worldcup'
  ];

  for (const prio of priorityCompetitions) {
    const found = leagues.some((l) => l.id.toLowerCase() === prio);
    assert(found, `Priority competition ${prio} exists in leagues list`);
  }

  // 2. Test Standings for Priority Competitions
  for (const prio of priorityCompetitions) {
    const standingsRes = await repo.getLeagueStandings(prio);
    const standings = standingsRes.data;
    assert(standings !== null && standings.table.length > 0, `Standings for ${prio} has ${standings?.table.length} rows`);
    if (standings && standings.table.length > 0) {
      const topRow = standings.table[0];
      assert(topRow.position === 1, `${prio} 1st row position is 1 (${topRow.team.name})`);
      assert(typeof topRow.points === 'number', `${prio} points is number: ${topRow.points}`);
      assert(typeof topRow.goalDifference === 'number', `${prio} goalDifference is number: ${topRow.goalDifference}`);
      assert(typeof topRow.played === 'number', `${prio} played is number: ${topRow.played}`);
    }
  }

  // 3. Test Fixtures for Leagues (Previous, Today, Upcoming)
  for (const prio of ['epl', 'laliga', 'seriea', 'bundesliga']) {
    const fixRes = await repo.getLeagueFixtures(prio);
    const matches = fixRes.data;
    assert(matches.length > 0, `League ${prio} has ${matches.length} fixtures`);
  }

  // 4. Test Top Scorers for Priority Competitions
  for (const prio of priorityCompetitions) {
    const scorersRes = await repo.getLeagueTopScorers(prio);
    const scorers = scorersRes.data;
    assert(scorers.length > 0, `Top scorers for ${prio} returned ${scorers.length} players`);
    if (scorers.length > 0) {
      const topScorer = scorers[0];
      assert(typeof topScorer.goals === 'number' && topScorer.goals > 0, `${prio} golden boot leader has ${topScorer.goals} goals (${topScorer.player.name})`);
      assert(topScorer.team !== undefined, `${prio} top scorer team is defined (${topScorer.team.name})`);
    }
  }

  // 5. Test Participating Teams for Priority Competitions
  for (const prio of ['epl', 'laliga', 'seriea', 'bundesliga']) {
    const teamsRes = await repo.getLeagueTeams(prio);
    const teams = teamsRes.data;
    assert(teams.length > 0, `Teams for ${prio} returned ${teams.length} clubs`);
    if (teams.length > 0) {
      assert(teams[0].name.length > 0, `Team name is valid: ${teams[0].name}`);
    }
  }

  // 6. Test Error Handling for non-existent league
  try {
    await repo.getLeagueStandings('unknown-league-999');
    assert(false, 'Should throw error for unknown league standings');
  } catch (err: any) {
    assert(true, 'Properly throws NotFoundError for unknown league standings');
  }

  console.log(`\nLEAGUE HUB TEST SUMMARY: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runLeagueHubTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
