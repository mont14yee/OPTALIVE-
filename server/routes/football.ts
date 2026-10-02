import { Router, Request, Response, NextFunction } from 'express';
import { footballRepository } from '../football/repository.js';
import { FootballValidator } from '../football/validator.js';
import { formatErrorResponse } from '../football/errors.js';
import { ProfileService } from '../services/profileService.js';

export const footballRouter = Router();

// Structured route logger & timing
footballRouter.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Helper for standardized success responses
function sendSuccess<T>(
  res: Response,
  data: T,
  options: {
    isStale?: boolean;
    cachedAt?: string;
    source?: string;
    total?: number;
    page?: number;
    statusCode?: number;
  } = {}
) {
  const count = Array.isArray(data) ? data.length : undefined;
  return res.status(options.statusCode || 200).json({
    success: true,
    data,
    meta: {
      count,
      total: options.total ?? count,
      page: options.page,
      isStale: options.isStale ?? false,
      cachedAt: options.cachedAt,
      provider: options.source || footballRepository.getActiveProviderName(),
      timestamp: new Date().toISOString()
    }
  });
}

// 1. GET /api/football/live
// Documented Sportmonks v3 inplay and latest updated livescores
footballRouter.get('/live', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const useLatest = req.query.latest === 'true' || req.query.mode === 'latest';
    const result = await footballRepository.getLiveMatches(useLatest);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /api/football/matches
footballRouter.get('/matches', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = FootballValidator.validateDate(req.query.date);
    const status = FootballValidator.validateStatus(req.query.status);
    const page = FootballValidator.validatePage(req.query.page);
    const leagueId = req.query.league_id ? FootballValidator.validateId(req.query.league_id, 'League') : undefined;
    const teamParam = req.query.team_id || req.query.team;
    const teamId = teamParam ? FootballValidator.validateId(teamParam, 'Team') : undefined;

    const result = await footballRepository.getMatches({
      date,
      status,
      page,
      leagueId,
      teamId
    });

    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source,
      total: result.total,
      page: result.page
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /api/football/matches/:id
footballRouter.get('/matches/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = FootballValidator.validateId(req.params.id, 'Match');
    const result = await footballRepository.getMatchById(matchId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 4. GET /api/football/matches/:id/events
footballRouter.get('/matches/:id/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = FootballValidator.validateId(req.params.id, 'Match');
    const result = await footballRepository.getMatchEvents(matchId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 5. GET /api/football/matches/:id/stats
footballRouter.get('/matches/:id/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = FootballValidator.validateId(req.params.id, 'Match');
    const result = await footballRepository.getMatchStats(matchId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 6. GET /api/football/matches/:id/lineups
footballRouter.get('/matches/:id/lineups', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = FootballValidator.validateId(req.params.id, 'Match');
    const result = await footballRepository.getMatchLineups(matchId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 7. GET /api/football/leagues
footballRouter.get('/leagues', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getLeagues();
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 8. GET /api/football/leagues/:id/standings
footballRouter.get('/leagues/:id/standings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagueId = FootballValidator.validateId(req.params.id, 'League');
    const result = await footballRepository.getLeagueStandings(leagueId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 9. GET /api/football/leagues/:id/fixtures
footballRouter.get('/leagues/:id/fixtures', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagueId = FootballValidator.validateId(req.params.id, 'League');
    const page = FootballValidator.validatePage(req.query.page);
    const result = await footballRepository.getLeagueFixtures(leagueId, page);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 9b. GET /api/football/leagues/:id/topscorers
footballRouter.get('/leagues/:id/topscorers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagueId = FootballValidator.validateId(req.params.id, 'League');
    const result = await footballRepository.getLeagueTopScorers(leagueId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 9c. GET /api/football/leagues/:id/teams
footballRouter.get('/leagues/:id/teams', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagueId = FootballValidator.validateId(req.params.id, 'League');
    const result = await footballRepository.getLeagueTeams(leagueId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 9d. GET /api/football/teams (all teams)
footballRouter.get('/teams', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const teams = ProfileService.getAllTeams();
    return sendSuccess(res, teams);
  } catch (err) {
    next(err);
  }
});

// 9e. GET /api/football/search (global football search across teams, players, competitions, fixtures)
footballRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = FootballValidator.validateSearchQuery(req.query.q);
    const category = FootballValidator.validateSearchCategory(req.query.category);
    const results = ProfileService.searchGlobal(query, category);
    return sendSuccess(res, results);
  } catch (err) {
    next(err);
  }
});

// 10. GET /api/football/teams/:id
footballRouter.get('/teams/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = FootballValidator.validateId(req.params.id, 'Team');
    const result = await footballRepository.getTeamById(teamId);
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 10b. GET /api/football/teams/:id/profile
footballRouter.get('/teams/:id/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const teamId = FootballValidator.validateId(req.params.id, 'Team');
    const profile = await ProfileService.getTeamProfile(teamId);
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

// 11. GET /api/football/players/:id
footballRouter.get('/players/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playerId = FootballValidator.validateId(req.params.id, 'Player');
    const player = await footballRepository.getPlayerById(playerId);
    return sendSuccess(res, player);
  } catch (err) {
    next(err);
  }
});

// 11b. GET /api/football/players/:id/profile
footballRouter.get('/players/:id/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const playerId = FootballValidator.validateId(req.params.id, 'Player');
    const profile = await ProfileService.getPlayerProfile(playerId);
    return sendSuccess(res, profile);
  } catch (err) {
    next(err);
  }
});

// 12. GET /api/football/news
footballRouter.get('/news', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getNews();
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// 13. GET /api/football/highlights
footballRouter.get('/highlights', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getHighlights();
    return sendSuccess(res, result.data, {
      isStale: result.isStale,
      cachedAt: result.cachedAt,
      source: result.source
    });
  } catch (err) {
    next(err);
  }
});

// Standardized safe error handler for footballRouter
footballRouter.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, body } = formatErrorResponse(err);
  res.status(statusCode).json(body);
});
