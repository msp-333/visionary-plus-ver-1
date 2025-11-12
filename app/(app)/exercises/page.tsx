'use client';

import {useDeferredValue, useMemo, useState, useId, KeyboardEvent} from 'react';
import Link from 'next/link';
import {useQuery} from '@tanstack/react-query';

type Exercise = {
  id: string;
  title: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: number;
  durationLabel?: string;
  description: string;
};

type SortKey = 'relevance' | 'title' | 'duration-asc' | 'duration-desc';

/** Brand tokens used in your project (v-ceil, v-dark, v-white, shadow-soft) */
const cardBase =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl ' +
  'border border-v-dark/10 bg-v-white p-5 shadow-soft transition ' +
  'hover:-translate-y-0.5 hover:shadow-lg focus-within:shadow-lg ' +
  'dark:bg-[#0b1a33] dark:border-white/10';
const chipTone =
  'rounded-full bg-v-ceil/15 px-2 py-1 text-v-dark/80 ' +
  'dark:bg-v-ceil/25 dark:text-white/90';
const chipNeutral =
  'rounded-full bg-v-dark/5 px-2 py-1 text-v-dark/70 ' +
  'dark:bg-white/10 dark:text-white/80';

const categories = ['All', 'Relaxation', 'Focus', 'Mobility', 'Habits', 'Convergence', 'Therapy'] as const;
const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'] as const;

/* ---------------------------------------------
 * Page
 * -------------------------------------------*/
export default function Exercises() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<(typeof categories)[number]>('All');
  const [level, setLevel] = useState<(typeof levels)[number]>('All');
  const [sort, setSort] = useState<SortKey>('relevance');

  const dq = useDeferredValue(q);

  const searchId = useId();
  const categoryId = useId();
  const levelId = useId();
  const sortId = useId();

  const {data, isLoading, isError, error, refetch} = useQuery({
    queryKey: ['exercises', dq, category, level],
    // TanStack Query v5 gives signal to abort in-flight fetches when key changes
    queryFn: async ({signal}) => {
      const params = new URLSearchParams();
      if (dq) params.set('q', dq);
      if (category !== 'All') params.set('category', category);
      if (level !== 'All') params.set('level', level);
      const res = await fetch(`/api/exercises?${params.toString()}`, {cache: 'no-store', signal});
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as Exercise[];
    },
    staleTime: 30_000, // smooth browsing between filters
  });

  const sorted = useMemo(() => {
    if (!data) return [];
    if (sort === 'relevance') return data;
    if (sort === 'title') return [...data].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'duration-asc') return [...data].sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
    if (sort === 'duration-desc') return [...data].sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
    return data;
  }, [data, sort]);

  const resultsCount = sorted.length;

  return (
    <section className="py-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-manrope text-3xl font-extrabold text-v-dark dark:text-v-white">Exercises</h1>
          <p className="mt-1 text-v-dark/80 dark:text-v-white/80">
            Short, guided routines to reduce eye strain and improve comfort.
          </p>
        </div>
        {/* Live region for results count (updates as you filter/search) */}
        <p className="text-sm text-v-dark/70 dark:text-white/70" aria-live="polite">
          {isLoading ? 'Loading…' : `${resultsCount} result${resultsCount === 1 ? '' : 's'}`}
        </p>
      </header>

      {/* Toolbar (sticky, trimmed spacing) */}
      <div className="sticky top-4 z-10 mt-5 rounded-2xl border border-v-dark/10 bg-v-white/85 p-3 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1a33]/85">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="w-full md:w-[340px]">
            <label htmlFor={searchId} className="sr-only">
              Search exercises
            </label>
            <input
              id={searchId}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search exercises"
              className="w-full rounded-xl border border-v-dark/10 bg-v-white px-4 py-2 text-v-dark outline-none ring-v-ceil/30 focus:ring-4 dark:bg-[#0b1a33] dark:text-v-white dark:border-white/10"
            />
          </div>

          {/* Categories (radio group with roving tabindex + arrow keys) */}
          <RadioChips
            id={categoryId}
            label="Category"
            options={categories as unknown as string[]}
            value={category}
            onChange={(v) => setCategory(v as (typeof categories)[number])}
          />

          {/* Levels (segmented, radio semantics) */}
          <SegmentedRadios
            id={levelId}
            label="Level"
            options={levels as unknown as string[]}
            value={level}
            onChange={(v) => setLevel(v as (typeof levels)[number])}
          />

          {/* Sort (compact, aligned to the end) */}
          <div className="ml-auto flex items-center gap-2 text-sm text-v-dark/70 dark:text-white/70">
            <label htmlFor={sortId}>Sort</label>
            <select
              id={sortId}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-v-dark/10 bg-v-white px-3 py-1.5 text-v-dark dark:bg-[#0b1a33] dark:text-v-white dark:border-white/10"
              aria-label="Sort exercises"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title A–Z</option>
              <option value="duration-asc">Short → Long</option>
              <option value="duration-desc">Long → Short</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <ResultsGrid
        isLoading={isLoading}
        isError={isError}
        error={error as Error | undefined}
        onRetry={refetch}
        items={sorted}
        query={q}
      />
    </section>
  );
}

/* ---------------------------------------------
 * Toolbar widgets (accessible radios)
 * -------------------------------------------*/
function RadioChips({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selectedIndex = options.indexOf(value);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    const next = (selectedIndex + dir + options.length) % options.length;
    onChange(options[next]);
  };
  return (
    <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-labelledby={`${id}-label`} onKeyDown={onKey}>
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      {options.map((opt, i) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt)}
            className={
              'rounded-full px-3 py-1 text-sm outline-none transition ' +
              (selected
                ? 'bg-v-ceil text-white ring-4 ring-v-ceil/25'
                : 'bg-v-dark/5 text-v-dark hover:bg-v-dark/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20 focus-visible:ring-4 focus-visible:ring-v-ceil/30')
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SegmentedRadios({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const selectedIndex = options.indexOf(value);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1;
    const next = (selectedIndex + dir + options.length) % options.length;
    onChange(options[next]);
  };
  return (
    <div
      className="inline-flex overflow-hidden rounded-xl ring-1 ring-v-dark/10 dark:ring-white/10"
      role="radiogroup"
      aria-labelledby={`${id}-label`}
      onKeyDown={onKey}
    >
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <button
            key={opt}
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt)}
            className={
              'px-3 py-1.5 text-sm outline-none transition ' +
              (selected
                ? 'bg-v-ceil text-white ring-4 ring-v-ceil/25'
                : 'bg-v-white text-v-dark hover:bg-v-dark/5 dark:bg-[#0b1a33] dark:text-white/85 dark:hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-v-ceil/30')
            }
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------
 * Results Grid (stable layout)
 * -------------------------------------------*/
function ResultsGrid({
  isLoading,
  isError,
  error,
  onRetry,
  items,
  query,
}: {
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  onRetry: () => void;
  items: Exercise[];
  query: string;
}) {
  // Reserve vertical space to avoid layout shift when toggling filters
  return (
    <div className="mt-6 min-h-[520px]">
      {isError ? (
        <div className="rounded-2xl border border-red-300/40 bg-red-50 p-4 text-red-800 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
          <div className="flex items-start justify-between gap-3">
            <p>Failed to load: {error?.message}</p>
            <button
              onClick={onRetry}
              className="rounded-lg bg-red-600/10 px-3 py-1.5 text-sm text-red-700 hover:bg-red-600/20 dark:text-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      ) : isLoading ? (
        <SkeletonGrid />
      ) : items.length ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-busy={isLoading}
          aria-live="polite"
        >
          {items.map((ex) => (
            <li key={ex.id}>
              <ExerciseCard ex={ex} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState query={query} onReset={onRetry} />
      )}
    </div>
  );
}

/* ---------------------------------------------
 * Cards
 * -------------------------------------------*/
function ExerciseCard({ex}: {ex: Exercise}) {
  return (
    <article className={cardBase + ' min-h-[232px]'} aria-labelledby={`ex-${ex.id}-title`}>
      {/* Accent stripe */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-v-ceil/80 via-v-ceil/20 to-v-ceil/80" />
      <div className="flex items-start justify-between gap-3">
        <h3 id={`ex-${ex.id}-title`} className="font-manrope text-lg font-semibold text-v-dark dark:text-v-white">
          {ex.title}
        </h3>
        <span className={chipNeutral + ' shrink-0 px-3'}>
          {ex.durationLabel ?? (ex.duration ? `${ex.duration}m` : '—')}
        </span>
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-v-dark/85 dark:text-v-white/85">{ex.description}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={chipTone}>{ex.category}</span>
        <span className={chipTone}>{ex.level}</span>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-4">
        <Link
          href={`/exercises/${ex.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
          aria-label={`Start ${ex.title}`}
        >
          Start
        </Link>
        <Link
          href={`/exercises/${ex.id}`}
          className="text-sm text-v-dark/70 underline-offset-2 hover:text-v-dark hover:underline dark:text-white/75 dark:hover:text-white"
          aria-label={`View details for ${ex.title}`}
        >
          Details
        </Link>
      </div>
    </article>
  );
}

/* ---------------------------------------------
 * Skeleton / Empty
 * -------------------------------------------*/
function SkeletonGrid() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({length: 6}).map((_, i) => (
        <li key={i}>
          <div className="min-h-[232px] rounded-2xl border border-v-dark/10 bg-v-white p-5 shadow-soft dark:bg-[#0b1a33] dark:border-white/10">
            <div className="h-4 w-1/2 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
            <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
            <div className="mt-1 h-3 w-2/3 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
            <div className="mt-4 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-v-dark/10 dark:bg-white/10" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-v-dark/10 dark:bg-white/10" />
            </div>
            <div className="mt-4 h-9 w-24 animate-pulse rounded-xl bg-v-dark/10 dark:bg-white/10" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({query, onReset}: {query: string; onReset: () => void}) {
  return (
    <div className="rounded-2xl border border-v-dark/10 bg-v-white p-8 text-center dark:border-white/10 dark:bg-[#0b1a33]">
      <h3 className="font-manrope text-lg font-semibold text-v-dark dark:text-white">No results</h3>
      <p className="mt-2 text-sm text-v-dark/75 dark:text-white/75">
        {query ? (
          <>We couldn’t find exercises matching “{query}”. Try a different search or filter.</>
        ) : (
          <>Try adjusting your filters.</>
        )}
      </p>
      <button
        onClick={onReset}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
      >
        Reset
      </button>
    </div>
  );
}
