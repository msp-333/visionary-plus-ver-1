'use client';

import React from 'react';
import Link from 'next/link';
import SleepReminderCard from '@/components/sleep/SleepReminderCard';
import { ToastProvider } from '@/lib/ui/Toast';
import { Moon, Wind, AlarmClock, BookOpenText, Bell, Sun } from 'lucide-react';

/* ---------- Utilities (read-only defaults for status) ---------- */
function readLS(key: string, fallback: string) {
  if (typeof window === 'undefined') return fallback;
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/* ---------- Page ---------- */
export default function SleepPage() {
  // Read-only status (keeps the “Tonight at a glance” card useful without the planner UI).
  const bedtime = readLS('sleep:bedtime', '22:30');
  const wake = readLS('sleep:wake', '06:30');
  const dnd = readLS('sleep:dnd', 'false') === 'true';

  const cardBase =
    'rounded-2xl border border-white/10 bg-white/5 shadow-soft h-full';

  return (
    <ToastProvider>
      <main
        className="
          min-h-[100dvh] text-white antialiased
          bg-[radial-gradient(1200px_600px_at_50%_-200px,rgba(101,146,225,0.20),transparent),#001130]
        "
      >
        {/* Header (no CTA) */}
        <header
          className="sticky top-0 z-10 border-b border-white/10 backdrop-blur bg-[#001130]/70"
          role="banner"
        >
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 place-items-center rounded-xl"
                style={{ backgroundColor: 'rgba(101,146,225,0.15)' }}
                aria-hidden
              >
                <Moon className="h-5 w-5 text-white/90" />
              </span>
              <div>
                <h1 className="font-manrope text-2xl md:text-3xl font-extrabold leading-tight">
                  Sleep
                </h1>
                <p className="mt-0.5 text-sm text-white/70">
                  Build a gentle wind-down and wake up refreshed.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* 2-column layout; first row cards share a minimum height for clean alignment */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Reminders */}
            <section
              className={`${cardBase} p-0 lg:min-h-[320px]`}
              aria-labelledby="reminders-title"
            >
              <h2 id="reminders-title" className="sr-only">
                Reminders
              </h2>
              <SleepReminderCard />
            </section>

            {/* Quick actions */}
            <section
              className={`${cardBase} p-5 lg:min-h-[320px]`}
              aria-labelledby="quick-title"
            >
              <h2 id="quick-title" className="font-manrope text-lg md:text-xl font-semibold">
                Quick actions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <Link
                  href="/exercises?category=Relaxation"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1a33] p-4
                             motion-safe:transition shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(101,146,225,0.35)]"
                >
                  <div className="flex items-center gap-3">
                    <Wind className="h-5 w-5 text-white/85" aria-hidden />
                    <div>
                      <p className="font-medium">Breathing session</p>
                      <p className="text-xs text-white/70">3–5 minutes to wind down</p>
                    </div>
                  </div>
                  <span className="text-xs text-white/60">Open</span>
                </Link>

                <Link
                  href="/tests?category=Sleep"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1a33] p-4
                             motion-safe:transition shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(101,146,225,0.35)]"
                >
                  <div className="flex items-center gap-3">
                    <AlarmClock className="h-5 w-5 text-white/85" aria-hidden />
                    <div>
                      <p className="font-medium">Sleepiness check</p>
                      <p className="text-xs text-white/70">Gauge daytime alertness</p>
                    </div>
                  </div>
                  <span className="text-xs text-white/60">Open</span>
                </Link>

                <Link
                  href="/blog?tag=sleep"
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-[#0b1a33] p-4
                             motion-safe:transition shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(101,146,225,0.35)]"
                >
                  <div className="flex items-center gap-3">
                    <BookOpenText className="h-5 w-5 text-white/85" aria-hidden />
                    <div>
                      <p className="font-medium">Read sleep tips</p>
                      <p className="text-xs text-white/70">Short guides and routines</p>
                    </div>
                  </div>
                  <span className="text-xs text-white/60">Open</span>
                </Link>
              </div>
            </section>

            {/* Tonight at a glance */}
            <section
              className={`${cardBase} p-5 lg:col-span-2`}
              aria-labelledby="status-title"
            >
              <h2 id="status-title" className="font-manrope text-lg md:text-xl font-semibold">
                Tonight at a glance
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-[#0b1a33] p-3">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <AlarmClock className="h-4 w-4" aria-hidden />
                    Bedtime
                  </div>
                  <p className="mt-1 text-lg font-semibold">{bedtime}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b1a33] p-3">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Sun className="h-4 w-4" aria-hidden />
                    Wake
                  </div>
                  <p className="mt-1 text-lg font-semibold">{wake}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0b1a33] p-3">
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Bell className="h-4 w-4" aria-hidden />
                    Quiet hours
                  </div>
                  <p className="mt-1 text-lg font-semibold">{dnd ? 'On' : 'Off'}</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </ToastProvider>
  );
}
