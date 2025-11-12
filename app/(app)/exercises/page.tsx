'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

type Exercise = {
  id: string
  title: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: number
  durationLabel?: string
  description: string
}

type SortKey = 'relevance' | 'title' | 'duration-asc' | 'duration-desc'

/* Consistent “white card” tokens */
const cardBase =
  'group relative flex h-full flex-col overflow-hidden rounded-2xl ' +
  'border border-v-dark/10 bg-v-white p-5 shadow-soft ' +
  'transition hover:-translate-y-0.5 hover:shadow-lg ' +
  'dark:bg-[#0b1a33] dark:border-white/10'
const chipTone =
  'rounded-full bg-v-ceil/15 px-2 py-1 text-v-dark/80 ' +
  'dark:bg-v-ceil/25 dark:text-white/90'
const chipNeutral =
  'rounded-full bg-v-dark/5 px-2 py-1 text-v-dark/70 ' +
  'dark:bg-white/10 dark:text-white/80'

export default function Exercises() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('All')
  const [level, setLevel] = useState('All')
  const [sort, setSort] = useState<SortKey>('relevance')

  const dq = useDeferredValue(q)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['exercises', dq, category, level],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dq) params.set('q', dq)
      if (category !== 'All') params.set('category', category)
      if (level !== 'All') params.set('level', level)
      const res = await fetch(`/api/exercises?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return (await res.json()) as Exercise[]
    }
  })

  const categories = ['All', 'Relaxation', 'Focus', 'Mobility', 'Habits', 'Convergence', 'Therapy']
  const levels: Array<Exercise['level'] | 'All'> = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const sorted = useMemo(() => {
    if (!data) return []
    if (sort === 'relevance') return data
    if (sort === 'title') return [...data].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'duration-asc') return [...data].sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0))
    if (sort === 'duration-desc') return [...data].sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0))
    return data
  }, [data, sort])

  return (
    <section className="py-6 sm:py-10">
      <h1 className="font-manrope text-3xl font-extrabold text-v-dark dark:text-v-white">Exercises</h1>
      <p className="mt-2 text-v-dark/80 dark:text-v-white/80">
        Short, guided routines to reduce eye strain and improve comfort.
      </p>

      {/* Toolbar — tightened so controls don’t overflow */}
      <div className="sticky top-4 z-10 mt-6 rounded-2xl border border-v-dark/10 bg-v-white/80 p-3 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1a33]/80">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search exercises…"
            className="w-full md:w-[320px] rounded-xl border border-v-dark/10 bg-v-white px-4 py-2 text-v-dark outline-none ring-v-ceil/30 focus:ring-4 dark:bg-[#0b1a33] dark:text-v-white dark:border-white/10"
          />

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={
                  'rounded-full px-3 py-1 text-sm transition ' +
                  (category === c
                    ? 'bg-v-ceil text-white'
                    : 'bg-v-dark/5 text-v-dark hover:bg-v-dark/10 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/20')
                }
              >
                {c}
              </button>
            ))}
          </div>

          {/* Level segmented control */}
          <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-v-dark/10 dark:ring-white/10">
            {levels.map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={
                  'px-3 py-1.5 text-sm transition ' +
                  (level === l
                    ? 'bg-v-ceil text-white'
                    : 'bg-v-white text-v-dark hover:bg-v-dark/5 dark:bg-[#0b1a33] dark:text-white/85 dark:hover:bg-white/10')
                }
              >
                {l}
              </button>
            ))}
          </div>

          {/* Sort (kept compact so it doesn’t push layout) */}
          <div className="ml-auto flex items-center gap-2 text-sm text-v-dark/70 dark:text-white/70">
            <span>Sort</span>
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
              className="rounded-xl border border-v-dark/10 bg-v-white px-3 py-1.5 text-v-dark dark:bg-[#0b1a33] dark:text-v-white dark:border-white/10"
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title A–Z</option>
              <option value="duration-asc">Short → Long</option>
              <option value="duration-desc">Long → Short</option>
            </select>
          </div>
        </div>
      </div>

      {/* States */}
      {isLoading && <SkeletonGrid />}
      {isError && (
        <div className="mt-6 rounded-2xl border border-red-300/40 bg-red-50 p-4 text-red-800 dark:border-red-400/30 dark:bg-red-950/40 dark:text-red-200">
          Failed to load: {(error as Error).message}
        </div>
      )}

      {!isLoading && !isError && (
        sorted.length ? (
          // Equal-height grid: min-h + flex cards
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map(ex => <ExerciseCard key={ex.id} ex={ex} />)}
          </div>
        ) : (
          <EmptyState query={q} />
        )
      )}
    </section>
  )
}

/* ---------- Cards ---------- */

function ExerciseCard({ ex }: { ex: Exercise }) {
  return (
    <article className={cardBase + ' min-h-[220px]'}>
      {/* Accent stripe fits rounded corners */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-v-ceil/80 via-v-ceil/20 to-v-ceil/80" />

      <div className="flex items-start justify-between gap-3">
        <h3 className="font-manrope text-lg font-semibold text-v-dark dark:text-v-white">
          {ex.title}
        </h3>
        <span className={chipNeutral + ' shrink-0 px-3'}>{ex.durationLabel ?? (ex.duration ? `${ex.duration}m` : '—')}</span>
      </div>

      <p className="mt-2 line-clamp-3 text-sm text-v-dark/85 dark:text-v-white/85">
        {ex.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={chipTone}>{ex.category}</span>
        <span className={chipTone}>{ex.level}</span>
      </div>

      {/* Push actions to the bottom so card heights align */}
      <div className="mt-auto pt-4 flex items-center gap-3">
        <Link
          href={`/exercises/${ex.id}`}
          className="inline-flex items-center justify-center rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-v-ceil/30"
        >
          Start
        </Link>
        <Link
          href={`/exercises/${ex.id}`}
          className="text-sm text-v-dark/70 underline-offset-2 hover:text-v-dark hover:underline dark:text-white/75 dark:hover:text-white"
        >
          Details
        </Link>
      </div>
    </article>
  )
}

/* ---------- Skeleton / Empty ---------- */

function SkeletonGrid() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="min-h-[220px] rounded-2xl border border-v-dark/10 bg-v-white p-5 shadow-soft dark:bg-[#0b1a33] dark:border-white/10">
          <div className="h-4 w-1/2 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
          <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
          <div className="mt-1 h-3 w-2/3 animate-pulse rounded bg-v-dark/10 dark:bg-white/10" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-v-dark/10 dark:bg-white/10" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-v-dark/10 dark:bg-white/10" />
          </div>
          <div className="mt-4 h-9 w-24 animate-pulse rounded-xl bg-v-dark/10 dark:bg-white/10" />
        </div>
      ))}
    </div>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-v-dark/10 bg-v-white p-8 text-center dark:border-white/10 dark:bg-[#0b1a33]">
      <h3 className="font-manrope text-lg font-semibold text-v-dark dark:text-white">No results</h3>
      <p className="mt-2 text-sm text-v-dark/75 dark:text-white/75">
        {query ? <>We couldn’t find exercises matching “{query}”. Try a different search or filter.</> : <>Try adjusting your filters.</>}
      </p>
    </div>
  )
}
