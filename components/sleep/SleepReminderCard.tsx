'use client';

import React, { useMemo, useState } from 'react';
import { useSleepReminder } from '@/lib/hooks/useSleepReminder';
import { formatPreview, formatTimeFromHM, MON_FIRST_DAY_ORDER, dayLabel } from '@/lib/sleep/schedule';
import { useToast } from '@/lib/ui/Toast';

const CEIL = '#6592E1';
const PASTEL = '#81B1E6';

export default function SleepReminderCard() {
  const {
    draft,
    setDraft,
    permission,
    requestPermission,
    save,
    enabled,
    setEnabled,
    lastMissedAt,
    openNotificationSettings,
    validation,
  } = useSleepReminder();

  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const timeValue = useMemo(() => {
    // <input type="time"> expects 24h "HH:MM"
    const h = String(draft.hour).padStart(2, '0');
    const m = String(draft.minute).padStart(2, '0');
    return `${h}:${m}`;
  }, [draft.hour, draft.minute]);

  const preview = useMemo(() => formatPreview(draft), [draft]);

  const onToggle = async () => {
    if (!enabled) {
      const p = await requestPermission();
      if (p !== 'granted') {
        // Will remain disabled; inline banner below explains.
        return;
      }
    }
    setEnabled(!enabled);
  };

  const onChangeTime: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const [h, m] = e.target.value.split(':').map(Number);
    if (Number.isFinite(h) && Number.isFinite(m)) {
      setDraft((s) => ({ ...s, hour: h, minute: m }));
    }
  };

  const toggleEveryDay = () => {
    setDraft((s) => {
      if (s.everyDay) {
        // Turning off "Every day" → keep a sensible default (weekdays)
        return { ...s, everyDay: false, days: [1, 2, 3, 4, 5] };
      } else {
        return { ...s, everyDay: true, days: [0, 1, 2, 3, 4, 5, 6] };
      }
    });
  };

  const toggleDay = (d: number) => {
    setDraft((s) => {
      if (s.everyDay) return s; // chips disabled when everyDay
      const has = s.days.includes(d);
      const nextDays = has ? s.days.filter((x) => x !== d) : [...s.days, d].sort((a, b) => a - b);
      return { ...s, days: nextDays };
    });
  };

  const onSave = async () => {
    setSaving(true);
    const result = await save();
    setSaving(false);

    if (result.ok) {
      toast.success('Bedtime reminder saved.');
    } else if (result.error === 'permission-denied') {
      toast.error('Notifications are blocked by your browser.');
    } else if (result.error === 'no-days') {
      toast.error('Please pick at least one day or enable “Every day”.');
    } else {
      toast.error('Could not save. Please try again.');
    }
  };

  return (
    <section
      aria-labelledby="bedtime-reminder-heading"
      className="rounded-2xl shadow-xl shadow-black/30 ring-1 ring-white/10 overflow-hidden"
      style={{
        backgroundColor: '#0A1C3A', // slightly lighter than #001130 for contrast inside card
      }}
    >
      {/* Gradient header strip */}
      <div
        className="h-2 w-full"
        style={{
          backgroundImage: `linear-gradient(90deg, ${CEIL} 0%, ${PASTEL} 100%)`,
        }}
      />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="bedtime-reminder-heading" className="font-[700] tracking-tight text-lg sm:text-xl" style={{ fontFamily: 'Manrope, Inter, ui-sans-serif, system-ui' }}>
              <span role="img" aria-label="moon">🌙</span> Bedtime Reminder
            </h2>
            <p className="mt-1 text-sm text-white/80">Good sleep helps your eyes recover.</p>
          </div>

          {/* Master Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label={enabled ? 'Turn bedtime reminder off' : 'Turn bedtime reminder on'}
            onClick={onToggle}
            className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full transition
              ${enabled ? 'bg-white/90' : 'bg-white/20'}
              focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/60 focus-visible:ring-offset-[#0A1C3A]
              motion-reduce:transition-none`}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-7 w-7 transform rounded-full bg-[#001130] shadow
                transition translate-x-1 ${enabled ? 'translate-x-8' : 'translate-x-1'} motion-reduce:transition-none`}
            />
          </button>
        </div>

        {/* Permissions denied banner */}
        {permission === 'denied' && (
          <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
            Notifications are blocked in your browser. Enable them to receive reminders.{' '}
            <button
              onClick={openNotificationSettings}
              className="underline decoration-red-300 underline-offset-2 hover:text-red-100"
            >
              Open Notification Settings
            </button>
          </div>
        )}

        {/* Missed reminder banner (from last app wake) */}
        {lastMissedAt && (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/90">
            You had a bedtime reminder at{' '}
            <strong>{formatTimeFromHM(lastMissedAt.getHours(), lastMissedAt.getMinutes())}</strong>.
          </div>
        )}

        {/* Controls */}
        <fieldset className="mt-6 space-y-6" disabled={!enabled}>
          {/* Time Picker */}
          <div className={enabled ? 'opacity-100' : 'opacity-50'}>
            <label htmlFor="sleep-time" className="block text-sm text-white/90">
              Time
            </label>
            <input
              id="sleep-time"
              type="time"
              step={60}
              className="mt-2 w-full rounded-xl border-0 bg-white/10 px-4 py-3 text-base text-white shadow-inner placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed"
              value={timeValue}
              onChange={onChangeTime}
            />
            <p className="mt-1 text-xs text-white/60">
              {enabled ? `Will remind at ${formatTimeFromHM(draft.hour, draft.minute)}.` : 'Reminders are off.'}
            </p>
          </div>

          {/* Days */}
          <div className={enabled ? 'opacity-100' : 'opacity-50'}>
            <div className="flex items-center justify-between">
              <label className="block text-sm text-white/90">Days</label>
              <button
                type="button"
                onClick={toggleEveryDay}
                className="text-sm underline decoration-white/40 underline-offset-4 hover:text-white/90 disabled:cursor-not-allowed"
                disabled={!enabled}
              >
                {draft.everyDay ? 'Customize days' : 'Every day'}
              </button>
            </div>

            {/* Day Chips */}
            <div className="mt-3 flex flex-wrap gap-2">
              {MON_FIRST_DAY_ORDER.map((d) => {
                const selected = draft.everyDay || draft.days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={selected}
                    disabled={draft.everyDay || !enabled}
                    onClick={() => toggleDay(d)}
                    className={`h-11 min-w-[3.25rem] rounded-xl px-3 text-sm font-medium
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
                      ${selected ? 'bg-white text-[#001130]' : 'bg-white/10 text-white'}
                      ${draft.everyDay || !enabled ? 'opacity-50' : 'hover:bg-white/20'}
                      motion-reduce:transition-none`}
                  >
                    {dayLabel(d).slice(0, 3)}
                  </button>
                );
              })}
            </div>

            {/* Validation message if no days selected */}
            {!draft.everyDay && draft.days.length === 0 && (
              <p className="mt-2 text-xs text-red-200">Pick at least one day or switch to “Every day”.</p>
            )}

            {/* Preview */}
            <p className="mt-3 text-sm text-white/80">
              {enabled ? preview : '—'}
            </p>
          </div>
        </fieldset>

        {/* Save button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={onSave}
            disabled={saving || (enabled && permission === 'denied') || validation === 'no-days'}
            className={`inline-flex w-full items-center justify-center rounded-xl bg-white px-5 py-3 text-[#001130] shadow 
              hover:bg-white/90 active:bg-white/80 disabled:cursor-not-allowed disabled:opacity-60
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none`}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <p className="mt-2 text-xs text-white/60">
            Notifications title: <em>“🌙 Bedtime Reminder”</em> • Body: <em>“Time to rest your eyes. Consistent sleep supports healthy vision.”</em>
          </p>
        </div>
      </div>
    </section>
  );
}
