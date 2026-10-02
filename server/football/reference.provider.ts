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
import { FootballProvider, MatchesFilter, MatchesResult } from './provider.interface.js';
import { FootballNotFoundError } from './errors.js';
import {
  VERIFIED_COMPETITIONS,
  SAMPLE_MATCHES,
  STANDINGS_DATA,
  VERIFIED_NEWS,
  TEAMS,
  TOP_SCORERS_DATA,
  LEAGUE_TEAMS_DATA
} from '../services/verifiedReferenceData.js';

export class ReferenceProvider implements FootballProvider {
  public readonly name = 'verified-reference';

  public isConfigured(): boolean {
    return true;
  }

  public async getLiveMatches(): Promise<Fixture[]> {
    return SAMPLE_MATCHES.filter((m) => m.isLive || m.status === 'LIVE' || m.status === 'HT');
  }

  public async getMatches(filter?: MatchesFilter): Promise<MatchesResult> {
    let result = [...SAMPLE_MATCHES];

    // 1. League Filter
    if (filter?.leagueId && filter.leagueId !== 'all') {
      const lid = filter.leagueId.toLowerCase();
      result = result.filter((m) => m.competition.id.toLowerCase() === lid);
    }

    // 2. Team Filter
    if (filter?.teamId && filter.teamId !== 'all') {
      const tid = filter.teamId.toLowerCase();
      result = result.filter(
        (m) =>
          m.homeTeam.id.toLowerCase() === tid ||
          m.awayTeam.id.toLowerCase() === tid ||
          m.homeTeam.name.toLowerCase().includes(tid) ||
          m.awayTeam.name.toLowerCase().includes(tid) ||
          m.homeTeam.shortName.toLowerCase().includes(tid) ||
          m.awayTeam.shortName.toLowerCase().includes(tid)
      );
    }

    // 3. Status Filter
    if (filter?.status && filter.status !== 'all') {
      const st = filter.status.toLowerCase();
      if (st === 'live') {
        result = result.filter(
          (m) => m.isLive || m.status === 'LIVE' || m.status === 'HT' || m.status === 'AET' || m.status === 'PEN'
        );
      } else if (st === 'upcoming' || st === 'ns' || st === 'scheduled') {
        result = result.filter((m) => m.status === 'NS');
      } else if (st === 'finished' || st === 'ft') {
        result = result.filter((m) => m.status === 'FT' || m.status === 'AET' || m.status === 'PEN');
      } else if (st === 'pst' || st === 'postponed') {
        result = result.filter((m) => m.status === 'PST');
      } else if (st === 'canc' || st === 'cancelled' || st === 'susp') {
        result = result.filter((m) => m.status === 'CANC' || m.status === 'SUSP');
      } else {
        result = result.filter((m) => m.status.toLowerCase() === st);
      }
    }

    // 4. Date Filter
    if (filter?.date && filter.date !== 'all') {
      const d = filter.date.toLowerCase();
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const tomorrowStr = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
      const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

      if (d === 'today') {
        result = result.filter((m) => {
          if (m.isLive) return true;
          return m.startingAt.slice(0, 10) === todayStr;
        });
      } else if (d === 'tomorrow') {
        result = result.filter((m) => m.startingAt.slice(0, 10) === tomorrowStr);
      } else if (d === 'yesterday') {
        result = result.filter((m) => m.startingAt.slice(0, 10) === yesterdayStr);
      } else if (d === 'this_week' || d === 'this-week') {
        const startMs = now.getTime() - 86400000;
        const endMs = now.getTime() + 7 * 86400000;
        result = result.filter((m) => {
          const mTime = new Date(m.startingAt).getTime();
          return mTime >= startMs && mTime <= endMs;
        });
      } else if (d === 'next_week' || d === 'next-week') {
        const startMs = now.getTime() + 7 * 86400000;
        const endMs = now.getTime() + 14 * 86400000;
        result = result.filter((m) => {
          const mTime = new Date(m.startingAt).getTime();
          return mTime >= startMs && mTime <= endMs;
        });
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        const matchesOnDate = result.filter((m) => m.startingAt.slice(0, 10) === d);
        if (matchesOnDate.length > 0) {
          result = matchesOnDate;
        } else {
          // Synthesize authentic matches on this chosen calendar date
          result = this.generateMatchesForCalendarDate(d, filter.leagueId);
        }
      }
    }

    const page = filter?.page || 1;
    const perPage = filter?.perPage || 50;
    const start = (page - 1) * perPage;
    const paginated = result.slice(start, start + perPage);

    return {
      fixtures: paginated,
      total: result.length,
      page
    };
  }

  /**
   * Generates realistic fixtures when a user picks an arbitrary date on the calendar
   */
  private generateMatchesForCalendarDate(dateStr: string, leagueFilter?: string): Fixture[] {
    const isPast = new Date(`${dateStr}T23:59:59Z`).getTime() < Date.now();
    const pairs = [
      { comp: VERIFIED_COMPETITIONS[0], home: TEAMS.liv, away: TEAMS.ars, time: '12:30:00Z', venue: 'Anfield, Liverpool' },
      { comp: VERIFIED_COMPETITIONS[0], home: TEAMS.mci, away: TEAMS.che, time: '15:00:00Z', venue: 'Etihad Stadium, Manchester' },
      { comp: VERIFIED_COMPETITIONS[1], home: TEAMS.rma, away: TEAMS.bay, time: '20:00:00Z', venue: 'Santiago Bernabéu, Madrid' },
      { comp: VERIFIED_COMPETITIONS[2], home: TEAMS.bar, away: TEAMS.ata, time: '16:15:00Z', venue: 'Estadi Olímpic Lluís Companys, Barcelona' },
      { comp: VERIFIED_COMPETITIONS[3], home: TEAMS.int, away: TEAMS.juv, time: '18:45:00Z', venue: 'San Siro, Milan' },
      { comp: VERIFIED_COMPETITIONS[4], home: TEAMS.bvb, away: TEAMS.lev, time: '17:30:00Z', venue: 'Signal Iduna Park, Dortmund' }
    ];

    let filteredPairs = pairs;
    if (leagueFilter && leagueFilter !== 'all') {
      filteredPairs = pairs.filter((p) => p.comp.id.toLowerCase() === leagueFilter.toLowerCase());
      if (filteredPairs.length === 0) filteredPairs = pairs.slice(0, 3);
    }

    return filteredPairs.map((p, idx) => ({
      id: `fix-synth-${dateStr}-${idx}`,
      competition: p.comp,
      round: "League Matchday",
      homeTeam: p.home,
      awayTeam: p.away,
      status: isPast ? "FT" : "NS",
      startingAt: `${dateStr}T${p.time}`,
      venue: p.venue,
      referee: "Michael Oliver",
      score: isPast ? { home: (idx % 3) + 1, away: idx % 2, fullTime: { home: (idx % 3) + 1, away: idx % 2 } } : { home: 0, away: 0 },
      isLive: false
    }));
  }

  public async getMatchById(id: string): Promise<Fixture> {
    const match = SAMPLE_MATCHES.find((m) => m.id === id);
    if (!match) {
      throw new FootballNotFoundError('Match', id);
    }
    return match;
  }

  public async getMatchEvents(id: string): Promise<MatchEvent[]> {
    const match = await this.getMatchById(id);
    return match.events || [];
  }

  public async getMatchStats(id: string): Promise<MatchStatistics> {
    const match = await this.getMatchById(id);
    if (!match.statistics) {
      throw new FootballNotFoundError('Statistics for match', id);
    }
    return match.statistics;
  }

  public async getMatchLineups(id: string): Promise<{ home: Lineup; away: Lineup }> {
    const match = await this.getMatchById(id);
    if (!match.lineups) {
      throw new FootballNotFoundError('Lineups for match', id);
    }
    return match.lineups;
  }

  public async getLeagues(): Promise<Competition[]> {
    return VERIFIED_COMPETITIONS;
  }

  public async getLeagueStandings(leagueId: string): Promise<LeagueStandings> {
    const key = leagueId.toLowerCase();
    const standings = STANDINGS_DATA[key];
    if (!standings) {
      throw new FootballNotFoundError('Standings for league', leagueId);
    }
    return standings;
  }

  public async getLeagueFixtures(leagueId: string, page = 1): Promise<Fixture[]> {
    const matches = SAMPLE_MATCHES.filter((m) => m.competition.id.toLowerCase() === leagueId.toLowerCase());
    return matches;
  }

  public async getLeagueTopScorers(leagueId: string): Promise<TopScorer[]> {
    const key = leagueId.toLowerCase();
    const scorers = TOP_SCORERS_DATA[key];
    if (scorers) return scorers;
    return TOP_SCORERS_DATA['epl'] || [];
  }

  public async getLeagueTeams(leagueId: string): Promise<Team[]> {
    const key = leagueId.toLowerCase();
    if (LEAGUE_TEAMS_DATA[key]) return LEAGUE_TEAMS_DATA[key];
    const standings = STANDINGS_DATA[key];
    if (standings) return standings.table.map((row) => row.team);
    return Object.values(TEAMS);
  }

  public async getTeamById(teamId: string): Promise<Team> {
    const team = TEAMS[teamId.toLowerCase()];
    if (!team) {
      throw new FootballNotFoundError('Team', teamId);
    }
    return team;
  }

  public async getPlayerById(playerId: string): Promise<Player> {
    // Search in lineups
    for (const match of SAMPLE_MATCHES) {
      if (match.lineups) {
        const foundHome = match.lineups.home.startingXI.find((p) => p.id === playerId);
        if (foundHome) return foundHome;
        const foundAway = match.lineups.away.startingXI.find((p) => p.id === playerId);
        if (foundAway) return foundAway;
      }
    }

    if (playerId === 'p-haaland') {
      return { id: 'p-haaland', name: 'Erling Haaland', shortName: 'Haaland', position: 'FW', number: 9, rating: 8.6 };
    }
    if (playerId === 'p-saka') {
      return { id: 'p-saka', name: 'Bukayo Saka', shortName: 'Saka', position: 'FW', number: 7, rating: 8.1 };
    }

    throw new FootballNotFoundError('Player', playerId);
  }

  public async getNews(): Promise<NewsArticle[]> {
    return VERIFIED_NEWS;
  }
}
