'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, ChevronRight } from 'lucide-react';

type Interval = { label: string; seconds: number };

type Exercise = {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: number;
  durationLabel?: string;
  steps: string[];
  benefits: string[];
  mode: 'timer' | 'interval' | 'reps' | 'info';
  timerSeconds?: number;
  optionsSeconds?: number[];
  intervals?: Interval[];
  cycles?: number;
  reps?: number;
};

const cardBase =
  'rounded-2xl border border-v-dark/10 bg-v-white p-4 md:p-5 shadow-soft dark:bg-[#0b1a33] dark:border-white/10';
const chipTone =
  'rounded-full bg-v-ceil/15 px-2 py-1 text-[11px] leading-5 text-v-dark/85 dark:bg-v-ceil/25 dark:text-white/90';
const chipNeutral =
  'rounded-full bg-v-dark/5 px-2 py-1 text-[11px] leading-5 text-v-dark/70 dark:bg-white/10 dark:text-white/80';

export default function ExerciseDetailClient({ ex }: { ex: Exercise }) {
  return (
    <section className="py-6 md:py-8 pb-28 md:pb-16">
      <Link
        href="/exercises"
        className="inline-flex items-center gap-2 text-sm text-v-dark/70 hover:text-v-dark dark:text-white/70 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>

      {/* Header */}
      <header className="mt-3 grid items-start gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <h1 className="font-manrope text-[28px] md:text-3xl lg:text-[34px] font-extrabold text-v-dark dark:text-white">
            {ex.title}
          </h1>
          <p className="mt-1 max-w-[68ch] text-sm md:text-base text-v-dark/80 dark:text-white/80">
            {ex.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={chipTone}>{ex.category}</span>
            <span className={chipTone}>{ex.level}</span>
            {(ex.durationLabel || ex.duration) && (
              <span className={chipNeutral}>{ex.durationLabel ?? `${ex.duration}m`}</span>
            )}
          </div>
        </div>

        <div className="md:justify-self-end md:self-start">
          <Link
            href={`/exercises/${ex.id}?tab=tutorial`}
            className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#6592E1] to-[#81B1E6]
                       px-4 md:px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(101,146,225,0.35)]
                       motion-safe:transition-all motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_12px_28px_rgba(101,146,225,0.45)]
                       focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/40"
            aria-label="Watch tutorial"
          >
            <span className="inline-grid place-items-center rounded-full bg-white/15 p-1.5" aria-hidden="true">
              <Play className="h-4 w-4 text-white" />
            </span>
            <span>Watch Tutorial</span>
            <ChevronRight className="h-4 w-4 opacity-80 group-hover:translate-x-0.5 motion-safe:transition-transform" aria-hidden />
          </Link>
        </div>
      </header>

      {/* Content grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-stretch">
        {/* Left column */}
        <div className="space-y-5">
          <section className={cardBase} aria-labelledby="howto-title">
            <h2 id="howto-title" className="font-manrope text-lg md:text-xl font-semibold text-v-dark dark:text-white">
              How to do it
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[13px] md:text-sm leading-6 text-v-dark/85 dark:text-white/85">
              {ex.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>

          <section className={cardBase} aria-labelledby="benefits-title">
            <h2 id="benefits-title" className="font-manrope text-lg md:text-xl font-semibold text-v-dark dark:text-white">
              Benefits
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[13px] md:text-sm leading-6 text-v-dark/85 dark:text-white/85">
              {ex.benefits.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right rail */}
        <div className="self-stretch">
          <SessionPanel ex={ex} />
        </div>
      </div>
    </section>
  );
}

/* ============================
   Session Panel (fills height)
============================ */
function SessionPanel({ ex }: { ex: Exercise }) {
  return (
    <section className={`${cardBase} h-full flex flex-col`} aria-labelledby="session-title">
      <h2 id="session-title" className="font-manrope text-lg md:text-xl font-semibold text-v-dark dark:text-white">
        Session
      </h2>
      <p className="mt-1 text-[13px] md:text-sm text-v-dark/75 dark:text-white/75">
        Follow the guide below. You can adjust pace as needed.
      </p>

      {ex.mode === 'timer' && <TimerSession ex={ex} />}
      {ex.mode === 'interval' && <IntervalSession ex={ex} />}
      {ex.mode === 'reps' && <RepsSession ex={ex} />}
      {ex.mode === 'info' && (
        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-[13px] md:text-sm text-v-dark/75 dark:text-white/75">
            This is an instruction-only exercise. Follow the steps above at your pace.
          </p>
          <Link
            href="/dashboard"
            className="mt-auto inline-flex items-center justify-center rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
          >
            Mark as Done
          </Link>
        </div>
      )}
    </section>
  );
}

/* ---------------- Timer ---------------- */
function TimerSession({ ex }: { ex: Exercise }) {
  const initial = ex.timerSeconds ?? 60;
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const total = useMemo(() => ex.timerSeconds ?? initial, [ex.timerSeconds, initial]);
  const elapsed = total - seconds;
  const pct = total ? Math.round((elapsed / total) * 100) : 0;

  const barId = useId();

  return (
    <div className="mt-4 flex flex-1 flex-col">
      {ex.optionsSeconds?.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Duration">
          {ex.optionsSeconds.map((opt) => {
            const selected = seconds === opt && !running;
            return (
              <button
                key={opt}
                role="radio"
                aria-checked={selected}
                tabIndex={selected ? 0 : -1}
                onClick={() => {
                  setRunning(false);
                  setSeconds(opt);
                }}
                className={
                  'rounded-full px-3 py-1.5 text-sm outline-none transition ' +
                  (selected
                    ? 'bg-v-ceil text-white ring-4 ring-v-ceil/25'
                    : 'bg-v-dark/5 text-v-dark hover:bg-v-dark/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20 focus-visible:ring-4 focus-visible:ring-v-ceil/30')
                }
              >
                {Math.round(opt / 60)}m
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="flex items-center justify-between text-[13px] md:text-sm">
        <label htmlFor={barId} className="text-v-dark/75 dark:text-white/75">
          Progress
        </label>
        <span className="text-v-dark dark:text-white" aria-live="polite">
          {formatTime(seconds)}
        </span>
      </div>

      <div
        id={barId}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={elapsed}
        className="mt-2 h-4 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10"
      >
        <div className="h-full bg-v-ceil motion-safe:transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex gap-2 pt-1 md:pt-2 mt-auto">
        <button
          onClick={() => setRunning((r) => !r)}
          className="rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
          aria-pressed={running}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(initial);
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* --------------- Intervals --------------- */
function IntervalSession({ ex }: { ex: Exercise }) {
  const seq = ex.intervals ?? [];
  const cycles = ex.cycles ?? 1;

  const [cycle, setCycle] = useState(1);
  const [idx, setIdx] = useState(0);
  const [seconds, setSeconds] = useState(seq[0]?.seconds ?? 0);
  const [running, setRunning] = useState(false);

  const current = seq[idx];

  useEffect(() => {
    if (!running || !current) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s > 1) return s - 1;
        if (idx < seq.length - 1) {
          setIdx((i) => i + 1);
          return seq[idx + 1].seconds;
        }
        if (cycle < cycles) {
          setCycle((c) => c + 1);
          setIdx(0);
          return seq[0].seconds;
        }
        setRunning(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, idx, seq, cycle, cycles, current]);

  const perCycle = seq.reduce((a, b) => a + b.seconds, 0);
  const totalSeconds = perCycle * cycles;

  const elapsed = () => {
    const elapsedInCycles = (cycle - 1) * perCycle;
    const elapsedInCurrent =
      seq.slice(0, idx).reduce((a, b) => a + b.seconds, 0) + ((current?.seconds ?? 0) - seconds);
    return elapsedInCycles + elapsedInCurrent;
  };

  const pct = totalSeconds ? Math.min(100, Math.round((elapsed() / totalSeconds) * 100)) : 0;
  const barId = useId();

  return (
    <div className="mt-4 flex flex-1 flex-col">
      <div className="rounded-xl bg-v-ceil/12 p-3 text-[13px] md:text-sm dark:bg-v-ceil/20" aria-live="polite">
        <div className="flex items-center justify-between">
          <span className="font-medium text-v-dark dark:text-white">{current?.label ?? 'Ready'}</span>
          <span className="text-v-dark dark:text-white">{seconds}s</span>
        </div>
        <p className="mt-1 text-[12px] md:text-xs text-v-dark/75 dark:text-white/75">
          Cycle {cycle} of {cycles}
        </p>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-[13px] md:text-sm">
          <label htmlFor={barId} className="text-v-dark/75 dark:text-white/75">
            Progress
          </label>
          <span className="text-v-dark dark:text-white">
            {elapsed()} / {totalSeconds}s
          </span>
        </div>

        <div
          id={barId}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalSeconds}
          aria-valuenow={elapsed()}
          className="mt-2 h-4 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10"
        >
          <div className="h-full bg-v-ceil motion-safe:transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-4 flex gap-2 pt-1 md:pt-2 mt-auto">
        <button
          onClick={() => {
            if (!running && seconds === 0 && seq.length) setSeconds(seq[0].seconds);
            setRunning((r) => !r);
          }}
          className="rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
          aria-pressed={running}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setRunning(false);
            setCycle(1);
            setIdx(0);
            setSeconds(seq[0]?.seconds ?? 0);
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* ---------------- Reps ---------------- */
function RepsSession({ ex }: { ex: Exercise }) {
  const goal = ex.reps ?? 10;
  const [count, setCount] = useState(0);
  const pct = Math.min(100, Math.round((count / goal) * 100));
  const barId = useId();

  return (
    <div className="mt-4 flex flex-1 flex-col">
      <div className="flex items-center justify-between text-[13px] md:text-sm">
        <label htmlFor={barId} className="text-v-dark/75 dark:text-white/75">
          Reps
        </label>
        <span className="text-v-dark dark:text-white">
          {count} / {goal}
        </span>
      </div>

      <div
        id={barId}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={count}
        className="mt-2 h-4 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10"
      >
        <div className="h-full bg-v-ceil motion-safe:transition-all" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-4 flex gap-2 pt-1 md:pt-2 mt-auto">
        <button
          onClick={() => setCount((c) => Math.min(goal, c + 1))}
          className="flex-1 rounded-xl bg-v-ceil px-4 py-3 text-sm font-semibold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
        >
          +1 Rep
        </button>
        <button
          onClick={() => setCount(0)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

/* --------------- Utils --------------- */
function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const ss = String(s % 60).padStart(2, '0');
  return `${m}:${ss}`;
}
