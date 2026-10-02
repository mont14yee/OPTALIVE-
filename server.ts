import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { footballRouter } from './server/routes/football.js';
import { footballRepository } from './server/football/repository.js';
import { geminiService } from './server/services/gemini.js';
import { sportmonksService } from './server/services/sportmonks.js';
import { FootballValidator } from './server/football/validator.js';
import { sanitizeSecrets, formatErrorResponse } from './server/football/errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Disable Express fingerprinting
app.disable('x-powered-by');

// Security Response Headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  // Allow framing only by trusted preview domains (Google AI Studio) and self
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.google.com https://*.googleusercontent.com https://*.run.app https://ai.google.dev;"
  );
  next();
});

// Configure CORS
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  maxAge: 86400
}));

app.use(express.json({ limit: '100kb' }));

// No-cache header on all API routes to avoid stale or sensitive telemetry caching
app.use('/api', (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// --- Football Data Layer API Routes ---
app.use('/api/football', footballRouter);

// --- Status & AI Routes ---
app.get('/api/status', (_req: Request, res: Response) => {
  const isSportmonksConfigured = footballRepository.isSportmonksConfigured();
  res.json({
    sportmonksConfigured: isSportmonksConfigured,
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    dataSource: isSportmonksConfigured ? 'live-sportmonks' : 'verified-reference',
    provider: footballRepository.getActiveProviderName(),
    lastSync: new Date().toISOString()
  });
});

// Backward-compatibility aliases for existing UI bindings with strict input validation
app.get('/api/competitions', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getLeagues();
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/matches/live', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getLiveMatches();
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/matches/fixtures', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const date = FootballValidator.validateDate(req.query.date);
    const competitionId = req.query.competitionId ? FootballValidator.validateId(req.query.competitionId, 'League') : undefined;
    const result = await footballRepository.getMatches({ date, leagueId: competitionId });
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/matches/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const matchId = FootballValidator.validateId(req.params.id, 'Match');
    const result = await footballRepository.getMatchById(matchId);
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/standings/:competitionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leagueId = FootballValidator.validateId(req.params.competitionId, 'League');
    const result = await footballRepository.getLeagueStandings(leagueId);
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/news', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await footballRepository.getNews();
    res.json(result.data);
  } catch (err) {
    next(err);
  }
});

app.get('/api/highlights', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const highlights = await sportmonksService.getHighlights();
    res.json(highlights);
  } catch (error) {
    console.error('[API Highlights Error]', sanitizeSecrets(String(error)));
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
});

// AI Tactical Analysis for a specific match (Legacy endpoint)
app.post('/api/ai/tactical-analysis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixtureId = FootballValidator.validateId(req.body.fixtureId, 'Fixture');
    const matchResult = await footballRepository.getMatchById(fixtureId);
    if (!matchResult.data) {
      return res.status(404).json({ error: 'Match not found for tactical analysis' });
    }

    const analysis = await geminiService.analyzeMatchTactics(matchResult.data);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Grounded AI Football Intelligence (MATCH_INSIGHT, TEAM_FORM_ANALYSIS, PLAYER_PERFORMANCE_SUMMARY, POST_MATCH_SUMMARY)
app.post('/api/ai/football-intelligence', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fixtureId = FootballValidator.validateId(req.body.fixtureId, 'Fixture');
    const type = FootballValidator.validateIntelligenceType(req.body.type);
    const playerId = req.body.playerId ? FootballValidator.validateId(req.body.playerId, 'Player') : undefined;

    const matchResult = await footballRepository.getMatchById(fixtureId);
    if (!matchResult.data) {
      return res.status(404).json({ error: 'Match not found for AI football intelligence' });
    }

    const intelligence = await geminiService.generateFootballIntelligence(matchResult.data, type, playerId);
    res.json(intelligence);
  } catch (error) {
    next(error);
  }
});

// Safe Centralized API Error Handler
app.use('/api', (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode, body } = formatErrorResponse(err);
  // Log sanitized diagnostic server-side
  console.error(`[API Error ${statusCode}]`, sanitizeSecrets(body.error.message));
  res.status(statusCode).json(body);
});

// --- Vite Integration & Static Serving ---
async function startServer() {
  if (!isProduction) {
    // Development mode: Mount Vite dev server middlewares
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });

    app.use(vite.middlewares);
    console.log('[Server] Vite middleware mounted in development mode');
  } else {
    // Production mode: Serve built dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log(`[Server] Serving production static files from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OPTALIVE Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
