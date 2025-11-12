import { z } from 'zod';

export const sleepReminderSchema = z.object({
  enabled: z.boolean(),
  hour: z.number().min(0).max(23),
  minute: z.number().min(0).max(59),
  days: z.array(z.number().int().min(0).max(6)), // 0=Sun..6=Sat
  everyDay: z.boolean(),
  tz: z.string(), // IANA
  lastCheckedAt: z.number().optional(), // epoch ms
});

export type SleepReminder = z.infer<typeof sleepReminderSchema>;

const STORAGE_KEY = 'visionary:sleep-reminder';

export const getDefaultSettings = (): SleepReminder => {
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC';
  return {
    enabled: false,
    hour: 22,
    minute: 0,
    days: [0, 1, 2, 3, 4, 5, 6],
    everyDay: true,
    tz,
    lastCheckedAt: Date.now(),
  };
};

function safeParse<T>(val: string | null, fallback: T): T {
  if (!val) return fallback;
  try {
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

export function getSettings(): SleepReminder {
  if (typeof window === 'undefined') return getDefaultSettings();
  const raw = safeParse<unknown>(localStorage.getItem(STORAGE_KEY), null);
  const parsed = sleepReminderSchema.safeParse(raw);
  if (parsed.success) {
    // Ensure defaults for any newly added fields
    const defaults = getDefaultSettings();
    return {
      ...defaults,
      ...parsed.data,
      days: parsed.data.everyDay ? [0, 1, 2, 3, 4, 5, 6] : parsed.data.days,
      lastCheckedAt: parsed.data.lastCheckedAt ?? Date.now(),
    };
  }
  // Corrupted or missing → reset to defaults
  const defaults = getDefaultSettings();
  saveSettings(defaults);
  return defaults;
}

export async function saveSettings(s: SleepReminder): Promise<void> {
  if (typeof window === 'undefined') return;
  const valid = sleepReminderSchema.parse(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
}
