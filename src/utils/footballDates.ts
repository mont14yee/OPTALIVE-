/**
 * Football Date & Timezone Utility
 * 
 * Strict compliance with requirements:
 * 1. Uses the user's local timezone for presentation while preserving
 *    the provider's canonical timestamps internally.
 * 2. Never uses browser-local date parsing in a way that can shift
 *    date-only fixtures unexpectedly (e.g., prevents "2026-09-29" parsed as UTC
 *    from rolling back to Sep 28 in Americas timezones).
 */

/**
 * Returns the user's detected local timezone (e.g., 'America/New_York', 'Europe/London')
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Returns the short timezone abbreviation (e.g., 'PDT', 'BST', 'CET', 'UTC')
 */
export function getTimezoneAbbreviation(date = new Date(), timezone = getUserTimezone()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timezone;
  } catch {
    return timezone;
  }
}

/**
 * Detects if a date string is date-only (e.g., "2026-09-29") without time component
 */
export function isDateOnly(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim());
}

/**
 * Safely parses "YYYY-MM-DD" into calendar components without UTC midnight timezone rolling.
 */
export function parseDateOnlyParts(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.trim().split('-');
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10), // 1-12
    day: parseInt(parts[2], 10)
  };
}

/**
 * Creates a safe Date object from a date-only string anchored at local noon.
 * This guarantees no DST boundary shifts or timezone shifts can alter the day of month.
 */
export function safeLocalDateFromDateOnly(dateStr: string): Date {
  const { year, month, day } = parseDateOnlyParts(dateStr);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Converts a canonical startingAt timestamp or date-only string to the user's local kickoff time.
 * e.g., "19:45" or "14:30". Returns "TBD" if date-only.
 */
export function formatKickoffTime(startingAt: string, timezone = getUserTimezone()): string {
  if (!startingAt) return 'TBD';

  if (isDateOnly(startingAt)) {
    return 'TBD';
  }

  try {
    const date = new Date(startingAt);
    if (isNaN(date.getTime())) return 'TBD';

    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch {
    return 'TBD';
  }
}

/**
 * Formats a fixture date for display without shifting date-only fixtures.
 * Handles both ISO 8601 timestamps and YYYY-MM-DD calendar dates.
 */
export function formatFixtureDate(
  startingAt: string,
  options: {
    includeDayOfWeek?: boolean;
    includeYear?: boolean;
    timezone?: string;
  } = {}
): string {
  if (!startingAt) return 'Date TBD';

  const { includeDayOfWeek = true, includeYear = false, timezone = getUserTimezone() } = options;

  if (isDateOnly(startingAt)) {
    // CRITICAL: Format strictly using local noon date to prevent day shifting
    const safeDate = safeLocalDateFromDateOnly(startingAt);
    const dtf = new Intl.DateTimeFormat(undefined, {
      weekday: includeDayOfWeek ? 'short' : undefined,
      month: 'short',
      day: 'numeric',
      year: includeYear ? 'numeric' : undefined
    });
    return dtf.format(safeDate);
  }

  // Full ISO timestamp: format using the specified timezone
  try {
    const date = new Date(startingAt);
    if (isNaN(date.getTime())) return 'Date TBD';

    return new Intl.DateTimeFormat(undefined, {
      timeZone: timezone,
      weekday: includeDayOfWeek ? 'short' : undefined,
      month: 'short',
      day: 'numeric',
      year: includeYear ? 'numeric' : undefined
    }).format(date);
  } catch {
    return 'Date TBD';
  }
}

/**
 * Convenient alias for calendar dates
 */
export function formatCalendarDateOnly(
  dateStr: string,
  options?: {
    includeDayOfWeek?: boolean;
    includeYear?: boolean;
    timezone?: string;
  }
): string {
  return formatFixtureDate(dateStr, options);
}

/**
 * Checks whether a startingAt timestamp or date falls on the user's local today, tomorrow, or yesterday.
 */
export function getRelativeDayLabel(startingAt: string, timezone = getUserTimezone()): string | null {
  if (!startingAt) return null;

  try {
    // Determine the calendar date in target timezone
    let targetYear: number, targetMonth: number, targetDay: number;

    if (isDateOnly(startingAt)) {
      const parts = parseDateOnlyParts(startingAt);
      targetYear = parts.year;
      targetMonth = parts.month;
      targetDay = parts.day;
    } else {
      const d = new Date(startingAt);
      if (isNaN(d.getTime())) return null;

      // Extract year, month, day in target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      });
      const parts = formatter.formatToParts(d);
      targetYear = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
      targetMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10);
      targetDay = parseInt(parts.find((p) => p.type === 'day')?.value || '0', 10);
    }

    // Now get today's year, month, day in target timezone
    const nowFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
    const nowParts = nowFormatter.formatToParts(new Date());
    const nowYear = parseInt(nowParts.find((p) => p.type === 'year')?.value || '0', 10);
    const nowMonth = parseInt(nowParts.find((p) => p.type === 'month')?.value || '0', 10);
    const nowDay = parseInt(nowParts.find((p) => p.type === 'day')?.value || '0', 10);

    const targetTime = new Date(targetYear, targetMonth - 1, targetDay).getTime();
    const nowTime = new Date(nowYear, nowMonth - 1, nowDay).getTime();
    const diffDays = Math.round((targetTime - nowTime) / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns today's ISO date in user's local timezone: "YYYY-MM-DD"
 */
export function getLocalTodayIsoDate(timezone = getUserTimezone()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Returns a date offset from today by X days in "YYYY-MM-DD" format
 */
export function getOffsetIsoDate(offsetDays: number, timezone = getUserTimezone()): string {
  try {
    const date = new Date(Date.now() + offsetDays * 86400000);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch {
    const date = new Date(Date.now() + offsetDays * 86400000);
    return date.toISOString().slice(0, 10);
  }
}

/**
 * Returns a 7-day strip centered around the selected date or today
 */
export interface CalendarDayItem {
  isoDate: string; // YYYY-MM-DD
  dayOfWeek: string; // "MON", "TUE"
  dayNumber: number; // 29
  monthShort: string; // "Sep"
  isToday: boolean;
  isSelected: boolean;
}

export function generateCalendarStrip(
  selectedIsoDate: string,
  daysCount = 7,
  timezone = getUserTimezone()
): CalendarDayItem[] {
  const todayIso = getLocalTodayIsoDate(timezone);
  
  // Anchor on selected date or today
  const anchorIso = isDateOnly(selectedIsoDate) ? selectedIsoDate : todayIso;
  const anchorDate = safeLocalDateFromDateOnly(anchorIso);

  const items: CalendarDayItem[] = [];
  // Center: 3 days before, anchor day, 3 days after
  const startOffset = -Math.floor(daysCount / 2);

  for (let i = 0; i < daysCount; i++) {
    const offset = startOffset + i;
    const current = new Date(anchorDate.getTime() + offset * 86400000);
    
    // Format YYYY-MM-DD
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    const isoDate = `${y}-${m}-${d}`;

    const dayOfWeek = current.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    const monthShort = current.toLocaleDateString(undefined, { month: 'short' });

    items.push({
      isoDate,
      dayOfWeek,
      dayNumber: current.getDate(),
      monthShort,
      isToday: isoDate === todayIso,
      isSelected: isoDate === selectedIsoDate
    });
  }

  return items;
}
