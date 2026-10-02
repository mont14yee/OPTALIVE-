import { FootballValidationError } from './errors.js';

export class FootballValidator {
  /**
   * Validate and sanitize resource ID parameter
   */
  public static validateId(id: unknown, resourceName = 'Resource'): string {
    if (typeof id !== 'string' || !id.trim()) {
      throw new FootballValidationError(`${resourceName} ID is required and must be a non-empty string.`);
    }

    const trimmed = id.trim();
    // Allow alphanumeric, dashes, underscores
    if (!/^[a-zA-Z0-9_\-]+$/.test(trimmed)) {
      throw new FootballValidationError(
        `Invalid ${resourceName} ID format: '${trimmed}'. Only alphanumeric, hyphen and underscore characters are allowed.`
      );
    }

    if (trimmed.length > 64) {
      throw new FootballValidationError(`Invalid ${resourceName} ID: exceeds maximum allowed length of 64 characters.`);
    }

    return trimmed;
  }

  /**
   * Validate date query parameter (YYYY-MM-DD or alias 'today'|'yesterday'|'tomorrow')
   */
  public static validateDate(date?: unknown): string | undefined {
    if (!date) return undefined;
    if (typeof date !== 'string') {
      throw new FootballValidationError("Query parameter 'date' must be a string.");
    }

    const trimmed = date.trim().toLowerCase();
    if (
      trimmed === 'today' ||
      trimmed === 'yesterday' ||
      trimmed === 'tomorrow' ||
      trimmed === 'this_week' ||
      trimmed === 'this-week' ||
      trimmed === 'next_week' ||
      trimmed === 'next-week' ||
      trimmed === 'all'
    ) {
      return trimmed;
    }

    // Check ISO YYYY-MM-DD
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!isoDateRegex.test(trimmed)) {
      throw new FootballValidationError(
        `Invalid date format '${trimmed}'. Date must be 'YYYY-MM-DD' or one of ['today', 'yesterday', 'tomorrow', 'this_week', 'next_week', 'all'].`
      );
    }

    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) {
      throw new FootballValidationError(`Invalid calendar date: '${trimmed}'.`);
    }

    return trimmed;
  }

  /**
   * Validate page query parameter
   */
  public static validatePage(page?: unknown): number {
    if (!page) return 1;
    const num = Number(page);
    if (!Number.isInteger(num) || num < 1 || num > 1000) {
      throw new FootballValidationError("Query parameter 'page' must be an integer between 1 and 1000.");
    }
    return num;
  }

  /**
   * Validate match status query parameter
   */
  public static validateStatus(status?: unknown): string | undefined {
    if (!status) return undefined;
    if (typeof status !== 'string') {
      throw new FootballValidationError("Query parameter 'status' must be a string.");
    }

    const allowed = ['all', 'live', 'ns', 'ft', 'ht', 'aet', 'pen', 'pst', 'canc', 'susp', 'upcoming', 'finished'];
    const trimmed = status.trim().toLowerCase();
    if (!allowed.includes(trimmed)) {
      throw new FootballValidationError(
        `Invalid status filter '${trimmed}'. Allowed values: ${allowed.join(', ')}.`
      );
    }

    return trimmed;
  }

  /**
   * Validate search query string against injection, control characters, and length limits
   */
  public static validateSearchQuery(query?: unknown): string {
    if (!query || typeof query !== 'string') return '';
    // Strip control characters and null bytes
    const cleaned = query.replace(/[\x00-\x1F\x7F<>]/g, '').trim();
    if (cleaned.length > 100) {
      return cleaned.slice(0, 100);
    }
    return cleaned;
  }

  /**
   * Validate search category parameter
   */
  public static validateSearchCategory(category?: unknown): 'all' | 'teams' | 'players' | 'competitions' | 'fixtures' {
    if (!category || typeof category !== 'string') return 'all';
    const trimmed = category.trim().toLowerCase();
    const allowed = ['all', 'teams', 'players', 'competitions', 'fixtures'] as const;
    if (allowed.includes(trimmed as typeof allowed[number])) {
      return trimmed as typeof allowed[number];
    }
    return 'all';
  }

  /**
   * Validate upstream provider URLs against SSRF
   */
  public static validateProviderUrl(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'https:') {
        throw new FootballValidationError('Only HTTPS provider endpoints are permitted.');
      }
      const allowedHosts = ['api.sportmonks.com', 'sportmonks.com'];
      if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
        throw new FootballValidationError(`Unauthorized provider host: ${parsed.hostname}`);
      }
      return parsed.toString();
    } catch (err: unknown) {
      if (err instanceof FootballValidationError) throw err;
      throw new FootballValidationError('Malformed provider URL.');
    }
  }

  /**
   * Validate AI Football Intelligence analysis type
   */
  public static validateIntelligenceType(type?: unknown): 'MATCH_INSIGHT' | 'TEAM_FORM_ANALYSIS' | 'PLAYER_PERFORMANCE_SUMMARY' | 'POST_MATCH_SUMMARY' {
    const allowed = ['MATCH_INSIGHT', 'TEAM_FORM_ANALYSIS', 'PLAYER_PERFORMANCE_SUMMARY', 'POST_MATCH_SUMMARY'] as const;
    if (typeof type === 'string') {
      const upper = type.trim().toUpperCase();
      if (allowed.includes(upper as typeof allowed[number])) {
        return upper as typeof allowed[number];
      }
    }
    return 'MATCH_INSIGHT';
  }
}
