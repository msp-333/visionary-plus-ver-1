import type { SleepReminder } from './storage';

// Day utilities
export const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
/** Mon-first order for UI chips (with Sunday at end) */
export const MON_FIRST_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export const dayLabel = (d: number) => DAY_ABBR[((d % 7) + 7) % 7];

const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatTime(date: Date, tz?: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
    }).format(date);
  } catch {
    // Fallback
    const h = date.getHours();
    const m = pad2(date.getMinutes());
    const am = h < 12 ? 'AM' : 'PM';
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${m} ${am}`;
  }
}

export function formatTimeFromHM(hour: number, minute: number, tz?: string) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return formatTime(d, tz);
}

function selectedDays(settings: SleepReminder): number[] {
  return settings.everyDay ? [0, 1, 2, 3, 4, 5, 6] : Array.from(new Set(settings.days)).sort((a, b) => a - b);
}

/**
 * Compute the next occurrence after `now` (strictly after or equal if still upcoming today).
 * Returns null if scheduling is disabled or no days selected.
 */
export function getNextOccurrence(settings: SleepReminder, now: Date): Date | null {
  if (!settings.enabled) return null;

  const days = selectedDays(settings);
  if (days.length === 0) return null;

  const nowDay = now.getDay();
  const base = new Date(now); // copy

  let next: Date | null = null;

  for (const d of days) {
    const diff = (d - nowDay + 7) % 7;
    const candidate = new Date(base);
    candidate.setHours(settings.hour, settings.minute, 0, 0);
    candidate.setDate(base.getDate() + diff);

    // If candidate is today but already passed, push to next week
    if (diff === 0 && candidate <= now) {
      candidate.setDate(candidate.getDate() + 7);
    }

    if (!next || candidate < next) {
      next = candidate;
    }
  }

  return next;
}

/**
 * Find all occurrences within (from, to] (exclusive of `from`, inclusive of `to`)
 * by iteratively computing the next occurrence.
 */
export function getOccurrencesBetween(
  settings: SleepReminder,
  from: Date,
  to: Date,
): Date[] {
  if (!settings.enabled) return [];
  const maxIters = 30; // safety cap
  let count = 0;

  const temp: SleepReminder = { ...settings, enabled: true };

  const results: Date[] = [];
  // Start search just before `from` to include the first occurrence after it
  let cursor = new Date(from.getTime());
  cursor.setSeconds(cursor.getSeconds() - 1);

  while (count < maxIters) {
    const next = getNextOccurrence(temp, cursor);
    if (!next || next > to) break;
    if (next > from && next <= to) results.push(next);

    // Step just past the found occurrence
    cursor = new Date(next.getTime() + 1000);
    count++;
  }
  return results;
}

export function formatPreview(settings: SleepReminder): string {
  const time = formatTimeFromHM(settings.hour, settings.minute, settings.tz);

  if (settings.everyDay) {
    return `Reminds at ${time} — Every day`;
  }

  const days = selectedDays(settings);
  if (days.length === 0) {
    return `Reminds at ${time} — (no days selected)`;
  }

  // Display in Mon-first order, but only chosen days
  const ordered = MON_FIRST_DAY_ORDER.filter((d) => days.includes(d)).map((d) => dayLabel(d));
  return `Reminds at ${time} on ${ordered.join(', ')}`;
}
