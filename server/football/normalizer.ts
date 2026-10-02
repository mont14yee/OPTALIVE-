import {
  Competition,
  Fixture,
  LeagueStandings,
  MatchEvent,
  MatchEventType,
  MatchStatistics,
  Lineup,
  PlayerInLineup,
  NewsArticle,
  StandingEntry,
  Team,
  Player,
  MatchStatus,
  TopScorer
} from '../../src/types/football.js';
import {
  RawSportmonksFixture,
  RawSportmonksEvent,
  RawSportmonksStatistic,
  RawSportmonksLineup,
  RawSportmonksLeague,
  RawSportmonksStandingRow,
  RawSportmonksTeam,
  RawSportmonksPlayer,
  RawSportmonksNews
} from './types.js';

export class FootballNormalizer {
  /**
   * Determine normalized MatchStatus from Sportmonks state_id or period info
   */
  public static mapStatus(stateId?: number, periodStr?: string, resultInfo?: string): MatchStatus {
    // Sportmonks standard state IDs:
    // 1: Not Started, 2: 1st Half, 3: Half Time, 4: 2nd Half, 5: Extra Time, 6: Penalties,
    // 7: Finished, 8: Cancelled, 9: Postponed, 10: Suspended, 11: Abandoned
    if (stateId === 1) return 'NS';
    if (stateId === 2 || stateId === 4) return 'LIVE';
    if (stateId === 3) return 'HT';
    if (stateId === 5) return 'AET';
    if (stateId === 6) return 'PEN';
    if (stateId === 7) return 'FT';
    if (stateId === 8) return 'CANC';
    if (stateId === 9) return 'PST';
    if (stateId === 10 || stateId === 11) return 'SUSP';

    if (periodStr) {
      const lower = periodStr.toLowerCase();
      if (lower.includes('half') || lower.includes('inplay') || lower.includes('live')) return 'LIVE';
      if (lower.includes('ht') || lower.includes('pause')) return 'HT';
      if (lower.includes('ft') || lower.includes('finish') || lower.includes('ended')) return 'FT';
    }

    if (resultInfo) {
      const lower = resultInfo.toLowerCase();
      if (lower.includes('ft') || lower.includes('final') || lower.includes('ended')) return 'FT';
      if (lower.includes('postponed')) return 'PST';
    }

    return 'NS';
  }

  /**
   * Normalize an event type string/code to standard MatchEventType
   */
  public static mapEventType(typeCode?: string, typeName?: string): MatchEventType {
    const term = `${typeCode || ''} ${typeName || ''}`.toLowerCase();
    if (term.includes('penalty') && term.includes('goal')) return 'penalty_goal';
    if (term.includes('own') && term.includes('goal')) return 'own_goal';
    if (term.includes('goal')) return 'goal';
    if (term.includes('missed') && term.includes('penalty')) return 'missed_penalty';
    if (term.includes('red') && term.includes('card')) return 'red_card';
    if (term.includes('yellow') && term.includes('card')) return 'yellow_card';
    if (term.includes('sub')) return 'substitution';
    if (term.includes('var')) return 'var';
    if (term.includes('woodwork') || term.includes('post') || term.includes('crossbar')) return 'woodwork';

    return 'goal'; // default fallback
  }

  /**
   * Safely normalize a raw Sportmonks fixture
   */
  public static normalizeFixture(raw: RawSportmonksFixture): Fixture {
    const homePart = raw.participants?.find((p) => p.meta?.location === 'home') || raw.participants?.[0];
    const awayPart = raw.participants?.find((p) => p.meta?.location === 'away') || raw.participants?.[1];

    const homeTeam: Team = {
      id: String(homePart?.id || 'home-tbd'),
      name: homePart?.name || 'Home Club',
      shortName: homePart?.short_code || homePart?.name?.split(' ')[0] || 'Home',
      code: homePart?.short_code || 'HOM',
      logoUrl: homePart?.image_path || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'
    };

    const awayTeam: Team = {
      id: String(awayPart?.id || 'away-tbd'),
      name: awayPart?.name || 'Away Club',
      shortName: awayPart?.short_code || awayPart?.name?.split(' ')[0] || 'Away',
      code: awayPart?.short_code || 'AWY',
      logoUrl: awayPart?.image_path || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'
    };

    // Calculate score
    let homeScore = 0;
    let awayScore = 0;
    let htHome: number | undefined;
    let htAway: number | undefined;

    if (raw.scores && Array.isArray(raw.scores)) {
      for (const s of raw.scores) {
        const goals = Number(s.score?.goals ?? 0);
        const loc = s.score?.participant;
        const desc = (s.description || '').toLowerCase();

        if (loc === 'home' || s.participant_id === homePart?.id) {
          if (desc.includes('current') || desc.includes('full') || desc.includes('normal')) {
            homeScore = goals;
          } else if (desc.includes('1st') || desc.includes('half')) {
            htHome = goals;
          }
        } else if (loc === 'away' || s.participant_id === awayPart?.id) {
          if (desc.includes('current') || desc.includes('full') || desc.includes('normal')) {
            awayScore = goals;
          } else if (desc.includes('1st') || desc.includes('half')) {
            htAway = goals;
          }
        }
      }
    }

    // Determine current period & minute
    const currentPeriod = raw.periods && raw.periods.length > 0 ? raw.periods[raw.periods.length - 1] : undefined;
    const minute = currentPeriod ? Number(currentPeriod.minutes || 0) : undefined;
    const status = this.mapStatus(raw.state_id, currentPeriod?.period, raw.result_info);
    const isLive = status === 'LIVE' || status === 'HT' || status === 'AET' || status === 'PEN';

    // League normalization
    const competition: Competition = raw.league
      ? this.normalizeCompetition(raw.league)
      : {
          id: String(raw.league_id || 'comp-default'),
          name: 'Football Championship',
          shortName: 'League',
          code: 'LGE',
          country: 'Global',
          logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png',
          colorGradient: 'from-blue-900 to-indigo-950'
        };

    // Events
    const events: MatchEvent[] = (raw.events || []).map((ev, idx) => ({
      id: String(ev.id || `ev-${idx}`),
      fixtureId: String(raw.id),
      minute: Number(ev.minute || 0),
      extraMinute: ev.extra_minute ? Number(ev.extra_minute) : undefined,
      type: this.mapEventType(ev.type?.code, ev.type?.name),
      teamId: String(ev.participant_id || (ev.player_name ? homeTeam.id : awayTeam.id)),
      player: {
        id: String(ev.player_id || `p-${idx}`),
        name: ev.player_name || 'Player'
      },
      assistPlayer: ev.related_player_name
        ? {
            id: String(ev.related_player_id || `rel-${idx}`),
            name: ev.related_player_name
          }
        : undefined,
      detail: ev.addition || ev.result
    }));

    // Statistics
    let statistics: MatchStatistics | undefined;
    if (raw.statistics && Array.isArray(raw.statistics) && raw.statistics.length > 0) {
      statistics = this.normalizeStatistics(raw.id, homeTeam.id, awayTeam.id, raw.statistics);
    }

    // Lineups
    let lineups: { home: Lineup; away: Lineup } | undefined;
    if (raw.lineups && Array.isArray(raw.lineups) && raw.lineups.length > 0) {
      lineups = this.normalizeLineups(raw.lineups, homeTeam.id, awayTeam.id);
    }

    return {
      id: String(raw.id),
      competition,
      round: raw.round_id ? `Round ${raw.round_id}` : undefined,
      homeTeam,
      awayTeam,
      status,
      minute,
      startingAt: raw.starting_at || new Date().toISOString(),
      venue: raw.venue ? `${raw.venue.name || 'Stadium'}, ${raw.venue.city_name || ''}` : 'Official Stadium',
      referee: (raw as any).referees?.[0]?.common_name || (raw as any).referees?.[0]?.name || (raw as any).referee?.common_name || (raw as any).referee?.name || undefined,
      score: {
        home: homeScore,
        away: awayScore,
        halfTime: htHome !== undefined && htAway !== undefined ? { home: htHome, away: htAway } : undefined
      },
      events: events.length > 0 ? events : undefined,
      statistics,
      lineups,
      playerStats: (raw as any).playerStats || undefined,
      isLive
    };
  }

  /**
   * Safely normalize raw statistics array
   */
  public static normalizeStatistics(
    fixtureId: number | string,
    homeTeamId: string,
    awayTeamId: string,
    rawStats: RawSportmonksStatistic[]
  ): MatchStatistics {
    const stats: MatchStatistics = {
      fixtureId: String(fixtureId),
      possession: { home: 50, away: 50 },
      xG: { home: 0, away: 0 },
      shotsTotal: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      shotsOffTarget: { home: 0, away: 0 },
      blockedShots: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
      offsides: { home: 0, away: 0 },
      bigChancesCreated: { home: 0, away: 0 },
      passesTotal: { home: 0, away: 0 },
      passAccuracy: { home: 0, away: 0 },
      attacks: { home: 0, away: 0 },
      dangerousAttacks: { home: 0, away: 0 },
      saves: { home: 0, away: 0 }
    };

    for (const item of rawStats) {
      const typeStr = `${item.type?.developer_name || ''} ${item.type?.name || ''} ${item.type?.code || ''}`.toLowerCase();
      const val = Number(item.data?.value ?? item.value ?? 0);
      const isHome = String(item.participant_id) === homeTeamId;
      const target = isHome ? 'home' : 'away';

      if (typeStr.includes('possession')) stats.possession[target] = val;
      else if (typeStr.includes('xg') || typeStr.includes('expected_goals')) stats.xG[target] = Number(val.toFixed(2));
      else if (typeStr.includes('shots_total') || typeStr.includes('total_shots')) stats.shotsTotal[target] = val;
      else if (typeStr.includes('shots_on_target') || typeStr.includes('on_target')) stats.shotsOnTarget[target] = val;
      else if (typeStr.includes('shots_off_target')) stats.shotsOffTarget[target] = val;
      else if (typeStr.includes('blocked_shots')) stats.blockedShots[target] = val;
      else if (typeStr.includes('corners')) stats.corners[target] = val;
      else if (typeStr.includes('fouls')) stats.fouls[target] = val;
      else if (typeStr.includes('yellow_cards')) stats.yellowCards[target] = val;
      else if (typeStr.includes('red_cards')) stats.redCards[target] = val;
      else if (typeStr.includes('offsides')) stats.offsides[target] = val;
      else if (typeStr.includes('passes_total') || typeStr.includes('passes')) stats.passesTotal[target] = val;
      else if (typeStr.includes('pass_accuracy') || typeStr.includes('accurate_passes_percentage')) stats.passAccuracy[target] = val;
      else if (typeStr.includes('dangerous_attacks')) stats.dangerousAttacks[target] = val;
      else if (typeStr.includes('attacks')) stats.attacks[target] = val;
      else if (typeStr.includes('saves')) stats.saves[target] = val;
    }

    return stats;
  }

  /**
   * Safely normalize raw lineups array
   */
  public static normalizeLineups(
    rawLineups: RawSportmonksLineup[],
    homeTeamId: string,
    awayTeamId: string
  ): { home: Lineup; away: Lineup } {
    const parsePlayer = (l: RawSportmonksLineup): PlayerInLineup => {
      const posCode = l.player?.position?.code?.toUpperCase() || 'MF';
      const normalizedPos = (['GK', 'DF', 'MF', 'FW'].includes(posCode) ? posCode : 'MF') as 'GK' | 'DF' | 'MF' | 'FW';

      return {
        id: String(l.player_id || l.player?.id || Math.random()),
        name: l.player?.display_name || l.player?.common_name || l.player_name || 'Squad Member',
        shortName: l.player?.common_name || l.player?.display_name?.split(' ').pop() || 'Player',
        position: normalizedPos,
        number: Number(l.jersey_number || 0),
        photoUrl: l.player?.image_path,
        formationIndex: l.formation_position,
        grid: l.formation_field
      };
    };

    const homeRaw = rawLineups.filter((l) => String(l.team_id) === homeTeamId);
    const awayRaw = rawLineups.filter((l) => String(l.team_id) === awayTeamId);

    const homeXI = homeRaw.filter((l) => l.type_id === 11 || !l.type_id).map(parsePlayer);
    const homeSubs = homeRaw.filter((l) => l.type_id === 12).map(parsePlayer);

    const awayXI = awayRaw.filter((l) => l.type_id === 11 || !l.type_id).map(parsePlayer);
    const awaySubs = awayRaw.filter((l) => l.type_id === 12).map(parsePlayer);

    return {
      home: {
        teamId: homeTeamId,
        formation: '4-3-3',
        startingXI: homeXI,
        substitutes: homeSubs
      },
      away: {
        teamId: awayTeamId,
        formation: '4-2-3-1',
        startingXI: awayXI,
        substitutes: awaySubs
      }
    };
  }

  /**
   * Safely normalize a raw league
   */
  public static normalizeCompetition(raw: RawSportmonksLeague): Competition {
    return {
      id: String(raw.id),
      name: raw.name || 'League Competition',
      shortName: raw.code || raw.name?.split(' ')[0] || 'League',
      code: raw.code || 'LG',
      country: raw.country?.name || 'International',
      logoUrl: raw.image_path || 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png',
      colorGradient: 'from-blue-900 to-indigo-950',
      isPopular: true
    };
  }

  /**
   * Safely normalize standings
   */
  public static normalizeStandings(rawRows: RawSportmonksStandingRow[], competition: Competition): LeagueStandings {
    const table: StandingEntry[] = rawRows.map((row, idx) => {
      let played = 0;
      let won = 0;
      let drawn = 0;
      let lost = 0;
      let gf = 0;
      let ga = 0;
      let gd = 0;

      if (row.details && Array.isArray(row.details)) {
        for (const d of row.details) {
          const code = (d.type?.developer_name || d.type?.code || '').toLowerCase();
          const val = Number(d.value || 0);
          if (code.includes('overall_matches_played') || code.includes('played')) played = val;
          else if (code.includes('overall_won') || code === 'w') won = val;
          else if (code.includes('overall_draw') || code === 'd') drawn = val;
          else if (code.includes('overall_lost') || code === 'l') lost = val;
          else if (code.includes('overall_goals_scored') || code.includes('gf')) gf = val;
          else if (code.includes('overall_goals_against') || code.includes('ga')) ga = val;
          else if (code.includes('goal_difference') || code.includes('gd')) gd = val;
        }
      }

      if (!gd && (gf || ga)) {
        gd = gf - ga;
      }

      const formArray: ('W' | 'D' | 'L')[] = (row.form || []).map((f) => {
        const char = (f.form || f.result || 'W').toUpperCase();
        return char === 'W' || char === 'D' || char === 'L' ? char : 'W';
      });

      const pos = Number(row.position || idx + 1);
      const zone: 'ucl' | 'uel' | 'relegation' | 'neutral' = 
        pos <= 4 ? 'ucl' : pos === 5 ? 'uel' : pos >= 18 ? 'relegation' : 'neutral';

      return {
        position: pos,
        team: {
          id: String(row.participant?.id || row.participant_id || `t-${idx}`),
          name: row.participant?.name || `Club ${pos}`,
          shortName: row.participant?.short_code || row.participant?.name?.split(' ')[0] || `Club ${pos}`,
          code: row.participant?.short_code || 'CLB',
          logoUrl: row.participant?.image_path || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'
        },
        played,
        won,
        drawn,
        lost,
        goalsFor: gf,
        goalsAgainst: ga,
        goalDifference: gd,
        points: Number(row.points || 0),
        form: formArray.length > 0 ? formArray : ['W', 'D', 'W'],
        zone
      };
    });

    return {
      competition,
      season: '2024/25',
      table
    };
  }

  /**
   * Safely normalize raw team
   */
  public static normalizeTeam(raw: RawSportmonksTeam): Team {
    const coach = raw.coaches && raw.coaches[0]?.coach?.display_name;
    return {
      id: String(raw.id),
      name: raw.name || 'Football Club',
      shortName: raw.short_code || raw.name?.split(' ')[0] || 'Club',
      code: raw.short_code || 'FC',
      logoUrl: raw.image_path || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg',
      stadium: raw.venue?.name,
      founded: raw.founded,
      manager: coach
    };
  }

  /**
   * Safely normalize raw player
   */
  public static normalizePlayer(raw: RawSportmonksPlayer): Player {
    const posCode = raw.position?.code?.toUpperCase() || 'MF';
    const position = (['GK', 'DF', 'MF', 'FW'].includes(posCode) ? posCode : 'MF') as 'GK' | 'DF' | 'MF' | 'FW';

    return {
      id: String(raw.id),
      name: raw.display_name || `${raw.firstname || ''} ${raw.lastname || ''}`.trim() || 'Player',
      shortName: raw.common_name || raw.display_name?.split(' ').pop() || 'Player',
      position,
      number: 10,
      photoUrl: raw.image_path,
      nationality: raw.nationality?.name
    };
  }

  /**
   * Safely normalize raw news
   */
  public static normalizeNews(raw: RawSportmonksNews): NewsArticle {
    const cat = (raw.category || 'general').toLowerCase();
    const category = (['transfer', 'injury', 'tactical', 'breaking', 'general'].includes(cat)
      ? cat
      : 'general') as 'transfer' | 'injury' | 'tactical' | 'breaking' | 'general';

    return {
      id: String(raw.id),
      title: raw.title || 'Football Intelligence Update',
      summary: raw.summary || raw.description || '',
      source: raw.source || 'Football News Wire',
      url: raw.url || 'https://news.google.com',
      publishedAt: raw.published_at || new Date().toISOString(),
      imageUrl: raw.image_path || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
      category
    };
  }

  /**
   * Safely normalize raw top scorers
   */
  public static normalizeTopScorers(rawRows: any[]): TopScorer[] {
    return (rawRows || []).map((row, index) => {
      const playerObj = row.player || {};
      const participantObj = row.participant || {};
      const goals = Number(row.total || row.goals || 0);

      const player: Player = {
        id: String(playerObj.id || `p-${index}`),
        name: playerObj.display_name || playerObj.name || 'Player',
        shortName: playerObj.common_name || playerObj.name?.split(' ').pop() || 'Player',
        position: 'FW',
        number: playerObj.jersey_number || 9,
        photoUrl: playerObj.image_path
      };

      const team: Team = {
        id: String(participantObj.id || `team-${index}`),
        name: participantObj.name || 'Club',
        shortName: participantObj.short_code || participantObj.name?.split(' ')[0] || 'Club',
        code: participantObj.short_code || 'FC',
        logoUrl: participantObj.image_path || 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Soccerball.svg'
      };

      return {
        position: index + 1,
        player,
        team,
        appearances: Number(row.appearances || 25),
        goals,
        assists: row.assists !== undefined ? Number(row.assists) : undefined,
        penalties: row.penalties !== undefined ? Number(row.penalties) : undefined
      };
    });
  }
}
