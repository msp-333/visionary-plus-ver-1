import { describe, it, expect } from 'vitest';
import { getNextOccurrence, getOccurrencesBetween, formatPreview } from '@/lib/sleep/schedule';
import type { SleepReminder } from '@/lib/sleep/storage';

const base: SleepReminder = {
  enabled: true,
  hour: 22,
  minute: 0,
  days: [1, 3, 5], // Mon, Wed, Fri (0=Sun..6=Sat)
  everyDay: false,
  tz: 'UTC',
  lastCheckedAt: undefined,
};

describe('schedule helpers', () => {
  it('next occurrence later today if not passed', () => {
    // Monday at 21:00 local
    const now = new Date(2025, 0, 6, 21, 0, 0);
    const next = getNextOccurrence(base, now);
    expect(next).not.toBeNull();
    expect(next!.getDay()).toBe(1); // Monday
    expect(next!.getHours()).toBe(22);
    expect(next!.getMinutes()).toBe(0);
  });

  it('next occurrence rolls to next selected day if passed today', () => {
    // Monday at 23:00 local
    const now = new Date(2025, 0, 6, 23, 0, 0);
    const next = getNextOccurrence(base, now);
    expect(next).not.toBeNull();
    expect(next!.getDay()).toBe(3); // Wednesday
  });

  it('occurrences between finds one hit', () => {
    const s = { ...base, hour: 7, minute: 30 };
    const from = new Date(2025, 0, 6, 7, 0, 0); // Mon 07:00
    const to = new Date(2025, 0, 6, 8, 0, 0);   // Mon 08:00
    const occs = getOccurrencesBetween(s, from, to);
    expect(occs.length).toBe(1);
    expect(occs[0].getHours()).toBe(7);
    expect(occs[0].getMinutes()).toBe(30);
  });

  it('preview formatting', () => {
    const s = { ...base };
    const text = formatPreview(s);
    expect(text).toMatch(/Reminds at/);
    expect(text).toMatch(/Mon, Wed, Fri/);
  });
});
