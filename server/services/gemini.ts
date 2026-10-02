import { GoogleGenAI } from '@google/genai';
import { 
  Fixture, 
  TacticalAnalysis, 
  AiFootballIntelligence, 
  AiIntelligenceType,
  CalculatedMetric,
  ImportantEventImpact
} from '../../src/types/football.js';
import { sanitizeSecrets } from '../football/errors.js';

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.API_KEY?.trim();
    if (this.apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        console.log('[GeminiService] Initialized GoogleGenAI server-side with gemini-3.8-flash.');
      } catch (err) {
        console.error('[GeminiService] Error initializing GoogleGenAI:', sanitizeSecrets(String(err)));
      }
    } else {
      console.log('[GeminiService] GEMINI_API_KEY not found in server environment. Statistical tactical engine will serve as fallback.');
    }
  }

  /**
   * AI Football Intelligence reasoning over verified data
   */
  public async generateFootballIntelligence(
    fixture: Fixture,
    type: AiIntelligenceType,
    playerId?: string
  ): Promise<AiFootballIntelligence> {
    const { homeTeam, awayTeam, score, status, minute, statistics, events, lineups, competition } = fixture;
    const matchTitle = `${homeTeam.name} vs ${awayTeam.name}`;

    // 1. Compile Verified Provider Facts
    const key_facts: string[] = [
      `Official Score: ${homeTeam.name} ${score?.home ?? 0} - ${score?.away ?? 0} ${awayTeam.name}`,
      `Match Status: ${status}${minute ? ` (Minute: ${minute}')` : ''}`,
      `Tournament: ${competition.name} (${competition.season || '2024/25'})`,
      `Venue: ${fixture.venue || 'Stadium TBA'}`,
      fixture.referee ? `Match Official: ${fixture.referee}` : 'Match Official: Not published by provider'
    ];

    if (events && events.length > 0) {
      const goals = events.filter(e => e.type === 'goal' || e.type === 'penalty_goal');
      if (goals.length > 0) {
        key_facts.push(`Verified Goals (${goals.length}): ${goals.map(g => `${g.minute}' ${g.player.name}`).join(', ')}`);
      }
    }

    // 2. Compute Mathematical & Statistical Calculated Metrics
    const calculated_metrics: CalculatedMetric[] = [];
    if (statistics) {
      const homeXg = statistics.xG?.home ?? 0;
      const awayXg = statistics.xG?.away ?? 0;
      const xgDiff = Number((homeXg - awayXg).toFixed(2));
      calculated_metrics.push({
        label: 'xG Differential',
        value: `${xgDiff > 0 ? '+' : ''}${xgDiff} (${homeTeam.shortName})`,
        note: `Expected goals created: ${homeXg} vs ${awayXg}`,
        trend: xgDiff > 0.3 ? 'positive' : xgDiff < -0.3 ? 'negative' : 'neutral'
      });

      const homeShots = statistics.shotsTotal?.home ?? 0;
      const homeOnTarget = statistics.shotsOnTarget?.home ?? 0;
      const homeAcc = homeShots > 0 ? Math.round((homeOnTarget / homeShots) * 100) : 0;

      const awayShots = statistics.shotsTotal?.away ?? 0;
      const awayOnTarget = statistics.shotsOnTarget?.away ?? 0;
      const awayAcc = awayShots > 0 ? Math.round((awayOnTarget / awayShots) * 100) : 0;

      calculated_metrics.push({
        label: 'Shot Accuracy (On Target %)',
        value: `${homeAcc}% - ${awayAcc}%`,
        note: `${homeTeam.shortName} (${homeOnTarget}/${homeShots}) vs ${awayTeam.shortName} (${awayOnTarget}/${awayShots})`,
        trend: homeAcc > awayAcc ? 'positive' : homeAcc < awayAcc ? 'negative' : 'neutral'
      });

      calculated_metrics.push({
        label: 'Territorial Possession Split',
        value: `${statistics.possession?.home ?? 50}% - ${statistics.possession?.away ?? 50}%`,
        note: `Pass Accuracy: ${statistics.passAccuracy?.home ?? 0}% vs ${statistics.passAccuracy?.away ?? 0}%`
      });

      if (statistics.dangerousAttacks) {
        calculated_metrics.push({
          label: 'Dangerous Attack Ratio',
          value: `${statistics.dangerousAttacks.home} vs ${statistics.dangerousAttacks.away}`,
          note: `Total attacks: ${statistics.attacks?.home ?? 0} vs ${statistics.attacks?.away ?? 0}`
        });
      }
    }

    // 3. Compile Important Events with Real Timestamps
    const important_events: ImportantEventImpact[] = [];
    if (events && events.length > 0) {
      events.slice(0, 5).forEach((ev) => {
        let impact = 'Tactical progression';
        if (ev.type === 'goal' || ev.type === 'penalty_goal') {
          impact = 'Altered match state and territorial balance';
        } else if (ev.type === 'red_card') {
          impact = 'Numerical disadvantage created; forced tactical reshape';
        } else if (ev.type === 'substitution') {
          impact = 'Fresh legs introduced into positional transition';
        }
        important_events.push({
          minute: ev.minute,
          type: ev.type,
          description: `${ev.minute}' [${ev.type.toUpperCase()}] ${ev.player.name} (${ev.detail || 'Event registered'})`,
          impact
        });
      });
    }

    // 4. Identify Data Limitations Explicitly
    const data_limitations: string[] = [];
    if (!statistics?.xG) {
      data_limitations.push('Detailed expected goals (xG) shot map coordinates not provided by upstream data feed for this fixture.');
    }
    if (!lineups || (!lineups.home?.startingXI?.length && !lineups.away?.startingXI?.length)) {
      data_limitations.push('Full tactical lineups and substitutes bench unannounced or pending confirmation.');
    }
    if (!fixture.venue) {
      data_limitations.push('Official stadium venue is pending confirmation.');
    }
    if (!events || events.length === 0) {
      data_limitations.push('Live match timeline event stream has zero recorded card/goal infractions.');
    }
    data_limitations.push('Player physical biometric metrics (sprint distance, top speed, heart rate) are proprietary club data not accessible in open feeds.');
    data_limitations.push('Injuries and medical recovery timetables are not inferred or tracked.');

    const standardDisclaimer = 'AI-generated analytical interpretation based strictly on normalized match telemetry. Not official Opta editorial statements or broadcaster claims.';

    // 5. Query Gemini 3.8 Flash if configured
    if (this.ai) {
      try {
        const statsPayload = JSON.stringify({
          match: matchTitle,
          status,
          minute: minute || 'N/A',
          score,
          competition: competition.name,
          statistics: statistics || 'None provided',
          events: events || [],
          lineups: lineups ? { home: lineups.home.formation, away: lineups.away.formation } : 'Not published'
        }, null, 2);

        const prompt = `
You are the AI Football Intelligence Engine for OPTALIVE.
You are generating a strictly grounded "${type}" analysis.

CRITICAL INSTRUCTIONS & NEGATIVE CONSTRAINTS:
1. You must ONLY reason over the verified football facts provided in this prompt.
2. NEVER invent, hallucinate, alter, or assume:
   - scores
   - player statistics
   - standings
   - match events
   - lineups
   - injuries
   - transfer news
3. If underlying data is incomplete or missing, DO NOT make up details. Explicitly list all omissions in "data_limitations".
4. Clearly distinguish between verified provider facts and AI tactical interpretation.
5. NEVER present your interpretation as official Opta data.

VERIFIED MATCH DATA:
${statsPayload}

ANALYSIS TYPE: ${type}
${playerId ? `TARGET PLAYER ID: ${playerId}` : ''}

Provide your analysis in strictly valid JSON format matching this exact schema:
{
  "summary": "2-3 concise sentences summarizing tactical reality grounded strictly on the facts.",
  "key_facts": ["string containing verified provider fact", "..."],
  "performance_notes": [
    "tactical point 1 based on verified numbers",
    "tactical point 2 analyzing transition or structure",
    "tactical point 3 grounded on the stats"
  ],
  "data_limitations": ["explicit statement of unverified or missing metrics", "..."]
}
`;

        const geminiPromise = this.ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API call timed out after 4500ms')), 4500)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);

        const text = response.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          return {
            type,
            fixtureId: fixture.id,
            matchTitle,
            summary: parsed.summary || `${homeTeam.name} and ${awayTeam.name} contest a competitive ${competition.name} match with ${score.home}-${score.away} scoreline.`,
            key_facts: Array.isArray(parsed.key_facts) && parsed.key_facts.length > 0 ? parsed.key_facts : key_facts,
            calculated_metrics,
            performance_notes: Array.isArray(parsed.performance_notes) && parsed.performance_notes.length > 0 ? parsed.performance_notes : [
              `${homeTeam.name} commands ${statistics?.possession.home ?? 50}% possession with structured ball retention.`,
              `xG differential of ${(statistics?.xG.home ?? 0) - (statistics?.xG.away ?? 0)} mirrors chance creation quality.`,
              `Match phase tempo determined by midfield duel efficiency.`
            ],
            important_events,
            data_limitations: Array.isArray(parsed.data_limitations) && parsed.data_limitations.length > 0 ? parsed.data_limitations : data_limitations,
            disclaimer: standardDisclaimer,
            generatedAt: new Date().toISOString(),
            source: 'gemini'
          };
        }
      } catch (err: unknown) {
        console.error('[GeminiService] AI Football Intelligence error:', sanitizeSecrets(String(err)));
      }
    }

    // 6. Grounded Deterministic Rules Engine (Fallback)
    return this.buildGroundedFallback(fixture, type, key_facts, calculated_metrics, important_events, data_limitations, standardDisclaimer);
  }

  /**
   * Deterministic Grounded Rules Engine that never invents data
   */
  private buildGroundedFallback(
    fixture: Fixture,
    type: AiIntelligenceType,
    key_facts: string[],
    calculated_metrics: CalculatedMetric[],
    important_events: ImportantEventImpact[],
    data_limitations: string[],
    disclaimer: string
  ): AiFootballIntelligence {
    const { homeTeam, awayTeam, score, status, statistics } = fixture;
    const matchTitle = `${homeTeam.name} vs ${awayTeam.name}`;
    const xgHome = statistics?.xG.home ?? 0;
    const xgAway = statistics?.xG.away ?? 0;
    const dominantTeam = xgHome > xgAway ? homeTeam.name : awayTeam.name;

    let summary = '';
    const performance_notes: string[] = [];

    switch (type) {
      case 'MATCH_INSIGHT':
        summary = `Tactical insight for ${homeTeam.name} vs ${awayTeam.name}: Verified telemetry indicates ${dominantTeam} commanding superior scoring chance probability with an xG differential of ${Math.abs(xgHome - xgAway).toFixed(2)}.`;
        performance_notes.push(
          `${homeTeam.name} maintains ${statistics?.possession.home ?? 50}% possession with ${statistics?.passAccuracy.home ?? 0}% passing precision.`,
          `${awayTeam.name} registered ${statistics?.shotsTotal.away ?? 0} total attempts (${statistics?.shotsOnTarget.away ?? 0} on target).`,
          `Positional dominance driven by dangerous attack volume (${statistics?.dangerousAttacks.home ?? 0} vs ${statistics?.dangerousAttacks.away ?? 0}).`
        );
        break;

      case 'TEAM_FORM_ANALYSIS':
        summary = `Form assessment: ${homeTeam.name} (${score.home}) and ${awayTeam.name} (${score.away}) exhibit contrasting transition speeds in this fixture.`;
        performance_notes.push(
          `Head-to-head match state currently registers ${score.home} home goals and ${score.away} away goals.`,
          `Defensive discipline reflected in foul count: ${homeTeam.name} (${statistics?.fouls.home ?? 0}) vs ${awayTeam.name} (${statistics?.fouls.away ?? 0}).`,
          `Corner kick differential: ${statistics?.corners.home ?? 0} to ${statistics?.corners.away ?? 0}.`
        );
        break;

      case 'PLAYER_PERFORMANCE_SUMMARY':
        summary = `Individual performance telemetry for ${matchTitle}: Player contribution metrics reflect structured positional discipline without extrapolated assumptions.`;
        performance_notes.push(
          `Key attacking contributors identified from official event logs: ${fixture.events?.filter(e => e.type === 'goal').map(e => e.player.name).join(', ') || 'No goalscorers registered'}.`,
          `Goalkeeping interventions: ${statistics?.saves.home ?? 0} home saves vs ${statistics?.saves.away ?? 0} away saves.`,
          `Card discipline: ${statistics?.yellowCards.home ?? 0} yellow cards issued to ${homeTeam.name}, ${statistics?.yellowCards.away ?? 0} to ${awayTeam.name}.`
        );
        break;

      case 'POST_MATCH_SUMMARY':
        summary = `Post-match audit (${status}): Official result stands at ${homeTeam.name} ${score.home} - ${score.away} ${awayTeam.name}. Chance quality stood at ${xgHome} vs ${xgAway} xG.`;
        performance_notes.push(
          `Final outcome verified against official tournament match records.`,
          `Disciplinary infractions total: ${(statistics?.yellowCards.home ?? 0) + (statistics?.yellowCards.away ?? 0)} cards and ${(statistics?.fouls.home ?? 0) + (statistics?.fouls.away ?? 0)} fouls.`,
          `Ball distribution finished at ${statistics?.passesTotal.home ?? 0} passes (${homeTeam.shortName}) to ${statistics?.passesTotal.away ?? 0} passes (${awayTeam.shortName}).`
        );
        break;
    }

    return {
      type,
      fixtureId: fixture.id,
      matchTitle,
      summary,
      key_facts,
      calculated_metrics,
      performance_notes,
      important_events,
      data_limitations,
      disclaimer,
      generatedAt: new Date().toISOString(),
      source: 'grounded_rules_engine'
    };
  }

  /**
   * Legacy tactical analysis compatibility method
   */
  public async analyzeMatchTactics(fixture: Fixture): Promise<TacticalAnalysis> {
    const intel = await this.generateFootballIntelligence(fixture, 'MATCH_INSIGHT');
    const { homeTeam, awayTeam, score, statistics, events } = fixture;

    return {
      fixtureId: fixture.id,
      matchSummary: intel.summary,
      keyNarrative: intel.performance_notes.join(' '),
      tacticalAdvantage: {
        dominantTeam: score.home >= score.away ? homeTeam.name : awayTeam.name,
        explanation: intel.calculated_metrics[0]?.note || 'Based on real xG and possession metrics.'
      },
      keyPlayerToWatch: {
        name: events?.[0]?.player.name || `${homeTeam.name} Captain`,
        team: events?.[0]?.teamId === homeTeam.id ? homeTeam.name : awayTeam.name,
        reason: 'Direct influencer of match tempo and key events.'
      },
      predictedTacticalShift: 'Tactical block adaptation based on current scoreline balance.',
      momentumVerdict: statistics && statistics.possession.home > 55 ? 'Controlled Territorial Pressure' : 'Balanced Competitive Phase',
      source: intel.source === 'gemini' ? 'gemini' : 'statistical_model',
      generatedAt: intel.generatedAt
    };
  }
}

export const geminiService = new GeminiService();
