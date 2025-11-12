'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSettings,
  saveSettings,
  getDefaultSettings,
  type SleepReminder,
} from '../sleep/storage';
import {
  getOccurrencesBetween,
  getNextOccurrence,
  formatTime,
} from '../sleep/schedule';

/**
 * Frontend-only bedtime reminder hook (PWA/web).
 * Uses polling while the tab is active + visibility catch-up.
 */

const QUERY_KEY = ['sleep-reminder-settings'] as const;

export type SaveResult =
  | { ok: true }
  | { ok: false; error: 'permission-denied' | 'no-days' | 'unknown' };

export function useSleepReminder() {
  const qc = useQueryClient();

  // Load settings from local storage
  const { data: stored } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => getSettings(),
    initialData: getDefaultSettings(),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: typeof window !== 'undefined',
  });

  // Local draft users edit before saving
  const [draft, setDraft] = useState<SleepReminder>(stored);
  useEffect(() => setDraft(stored), [stored]);

  const enabled = draft.enabled;

  // Validation (no-days only matters when not everyDay)
  const validation: 'ok' | 'no-days' =
    draft.everyDay || draft.days.length > 0 ? 'ok' : 'no-days';

  // Track last missed reminder (for inline UI if you want)
  const [lastMissedAt, setLastMissedAt] = useState<Date | null>(null);

  // Refs to avoid stale closures
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const settingsRef = useRef<SleepReminder>(stored);
  const lastCheckedAtRef = useRef<number>(stored.lastCheckedAt ?? Date.now());
  useEffect(() => {
    settingsRef.current = stored;
  }, [stored]);

  // Permission helpers
  const permission: NotificationPermission =
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default';

  const requestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied' as const;
    }
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied' as const;
    }
  };

  // --- Notification display (with SW if available) ---
  const showReminderNotification = async (overrideBody?: string) => {
    const title = '🌙 Bedtime Reminder';
    const body =
      overrideBody ??
      'Time to rest your eyes. Consistent sleep supports healthy vision.';

    const options: globalThis.NotificationOptions = {
      body,
      tag: 'visionary-bedtime-reminder',
      // renotify is optional and defaults to false; omitting avoids TS conflicts
      badge: '/icons/moon.svg',
      icon: '/icons/moon.svg',
      silent: false,
    };

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (Notification.permission === 'granted' && reg?.showNotification) {
          await reg.showNotification(title, options);
          return;
        }
      }
    } catch {
      // fall back to direct Notification below
    }

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(title, options);
    }
  };

  // Ensure timezone stored matches current
  const ensureTimezone = (s: SleepReminder): SleepReminder => {
    const currentTz =
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : s.tz;
    if (!currentTz || currentTz === s.tz) return s;
    return { ...s, tz: currentTz };
  };

  // (Re)start timers and catch up missed reminders
  const reschedule = async (s: SleepReminder) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    s = ensureTimezone(s);

    if (s.tz !== settingsRef.current.tz) {
      await saveSettings(s);
      qc.setQueryData(QUERY_KEY, s);
    }

    const now = Date.now();
    lastCheckedAtRef.current = Math.max(s.lastCheckedAt ?? 0, now);

    if (!s.enabled) return;

    // Catch up on missed occurrences since last check
    const missed = getOccurrencesBetween(
      s,
      new Date((s.lastCheckedAt ?? now) + 1),
      new Date(now)
    );
    if (missed.length > 0) {
      const last = missed[missed.length - 1];
      setLastMissedAt(last);
      await showReminderNotification(
        `You had a bedtime reminder at ${formatTime(last, s.tz)}.`
      );
    }

    // Persist lastCheckedAt after catch-up
    const updated: SleepReminder = { ...s, lastCheckedAt: now };
    await saveSettings(updated);
    qc.setQueryData(QUERY_KEY, updated);
    settingsRef.current = updated;
    lastCheckedAtRef.current = now;

    // Poll every 30s to detect when a scheduled time is crossed
    intervalRef.current = setInterval(async () => {
      const refSettings = settingsRef.current;
      if (!refSettings.enabled) return;

      const prev = lastCheckedAtRef.current;
      const current = Date.now();

      const between = getOccurrencesBetween(
        refSettings,
        new Date(prev + 1),
        new Date(current)
      );

      if (between.length > 0) {
        for (const occ of between) {
          void occ; // (not used, but keeps intent clear)
          await showReminderNotification();
        }
      }

      lastCheckedAtRef.current = current;
      const persisted = { ...refSettings, lastCheckedAt: current };
      await saveSettings(persisted);
      qc.setQueryData(QUERY_KEY, persisted);
      settingsRef.current = persisted;
    }, 30_000);
  };

  // Save + reschedule
  const mutation = useMutation({
    mutationFn: async (next: SleepReminder) => {
      await saveSettings(next);
      return next;
    },
    onSuccess: async (next) => {
      qc.setQueryData(QUERY_KEY, next);
      await reschedule(next);
    },
  });

  // On mount start the loop; cleanup on unmount
  useEffect(() => {
    reschedule(stored);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When tab becomes visible, catch up again
  useEffect(() => {
    const onVis = async () => {
      if (document.visibilityState !== 'visible') return;
      await reschedule(settingsRef.current);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // Toggle in UI (draft only)
  const setEnabled = (value: boolean) => {
    setDraft((s) => ({ ...s, enabled: value }));
  };

  // Save the draft
  const save = async (): Promise<SaveResult> => {
    if (draft.enabled) {
      const p = await requestPermission();
      if (p !== 'granted') {
        setDraft((s) => ({ ...s, enabled: false }));
        return { ok: false, error: 'permission-denied' };
      }
    }

    if (!draft.everyDay && draft.days.length === 0) {
      return { ok: false, error: 'no-days' };
    }

    const normalized: SleepReminder = {
      ...draft,
      days: draft.everyDay
        ? [0, 1, 2, 3, 4, 5, 6]
        : Array.from(new Set(draft.days)).sort((a, b) => a - b),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || draft.tz,
      lastCheckedAt: settingsRef.current.lastCheckedAt ?? Date.now(),
    };

    try {
      await mutation.mutateAsync(normalized);
      return { ok: true };
    } catch {
      return { ok: false, error: 'unknown' };
    }
  };

  // Open browser notification settings (best effort)
  const openNotificationSettings = () => {
    const ua = navigator.userAgent.toLowerCase();
    const targets: string[] = [];

    if (ua.includes('edg/'))
      targets.push('edge://settings/content/notifications');
    if (ua.includes('chrome') || ua.includes('crios') || ua.includes('brave'))
      targets.push(
        'chrome://settings/content/notifications',
        'brave://settings/content/notifications'
      );
    if (ua.includes('firefox')) targets.push('about:preferences#privacy');
    if (ua.includes('opr/') || ua.includes('opera'))
      targets.push('opera://settings/content/notifications');
    if (ua.includes('safari') && !ua.includes('chrome')) {
      alert(
        'On Safari: Settings → Websites → Notifications → Allow for this site.'
      );
      return;
    }

    for (const url of targets) {
      const win = window.open(url, '_blank');
      if (win) return;
    }
    alert('Open your browser settings and allow notifications for this site.');
  };

  return {
    draft,
    setDraft,
    enabled,
    setEnabled,
    permission,
    requestPermission,
    previewText: useMemo(() => formatPreview(draft), [draft]),
    save,
    lastMissedAt,
    openNotificationSettings,
    validation,
  };
}

/* ---------- Local helpers ---------- */

// Human-readable preview for the UI
function formatPreview(s: SleepReminder): string {
  if (!s.enabled) return 'Off';

  // pass "now" explicitly
  const next = getNextOccurrence(s, new Date());
  const timeLabel = next ? formatTime(next, s.tz) : '—';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysLabel = s.everyDay
    ? 'Every day'
    : s.days.slice().sort((a, b) => a - b).map((d) => dayNames[d] ?? '').join(', ');

  return `${daysLabel} · ${timeLabel}`;
}