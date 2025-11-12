'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

type Interval = { label: string; seconds: number }

type Exercise = {
  id: string
  title: string
  description: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration?: number
  durationLabel?: string
  steps: string[]
  benefits: string[]
  mode: 'timer' | 'interval' | 'reps' | 'info'
  timerSeconds?: number
  optionsSeconds?: number[]
  intervals?: Interval[]
  cycles?: number
  reps?: number
}

const cardBase =
  'rounded-2xl border border-v-dark/10 bg-v-white p-5 shadow-soft ' +
  'dark:bg-[#0b1a33] dark:border-white/10'
const chipTone =
  'rounded-full bg-v-ceil/15 px-2 py-1 text-v-dark/80 ' +
  'dark:bg-v-ceil/25 dark:text-white/90'
const chipNeutral =
  'rounded-full bg-v-dark/5 px-2 py-1 text-v-dark/70 ' +
  'dark:bg-white/10 dark:text-white/80'

export default function ExerciseDetail() {
  const params = useParams<{ id: string }>()
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const { data } = useQuery({
    queryKey: ['exercise', id],
    queryFn: async () => {
      const res = await fetch('/api/exercises?id=' + id, { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed')
      return (await res.json()) as Exercise
    }
  })

  if (!data) {
    return (
      <section className="py-6 sm:py-10">
        <p>Loading…</p>
      </section>
    )
  }

  return (
    <section className="py-6 sm:py-10">
      <a
        href="/exercises"
        className="text-sm text-v-dark/70 hover:text-v-dark dark:text-v-white/70 dark:hover:text-v-white underline-offset-2 hover:underline"
      >
        &larr; Back
      </a>

      <header className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-manrope text-3xl font-extrabold text-v-dark dark:text-v-white">
            {data.title}
          </h1>
          <p className="mt-1 max-w-prose text-v-dark/80 dark:text-v-white/80">
            {data.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={chipTone}>{data.category}</span>
            <span className={chipTone}>{data.level}</span>
            {(data.durationLabel || data.duration) && (
              <span className={chipNeutral}>
                {data.durationLabel ?? `${data.duration}m`}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left: Instructions */}
        <div className="lg:col-span-2">
          <div className={cardBase}>
            <h2 className="font-manrope text-xl font-semibold text-v-dark dark:text-v-white">
              How to do it
            </h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-v-dark/85 dark:text-v-white/85">
              {data.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </div>

          <div className={`${cardBase} mt-4`}>
            <h2 className="font-manrope text-xl font-semibold text-v-dark dark:text-v-white">
              Benefits
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-v-dark/85 dark:text-v-white/85">
              {data.benefits.map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Session */}
        <SessionPanel ex={data} />
      </div>
    </section>
  )
}

function SessionPanel({ ex }: { ex: Exercise }) {
  return (
    <div className={cardBase}>
      <h2 className="font-manrope text-xl font-semibold text-v-dark dark:text-v-white">
        Session
      </h2>
      <p className="mt-1 text-sm text-v-dark/75 dark:text-v-white/75">
        Follow the guide below. You can adjust pace as needed.
      </p>

      {ex.mode === 'timer' && <TimerSession ex={ex} />}
      {ex.mode === 'interval' && <IntervalSession ex={ex} />}
      {ex.mode === 'reps' && <RepsSession ex={ex} />}
      {ex.mode === 'info' && (
        <div className="mt-4">
          <p className="text-sm text-v-dark/75 dark:text-v-white/75">
            This is an instruction-only exercise. Follow the steps above at your
            own pace.
          </p>
          <a
            href="/dashboard"
            className="mt-4 inline-block rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Mark as Done
          </a>
        </div>
      )}
    </div>
  )
}

function TimerSession({ ex }: { ex: Exercise }) {
  const [seconds, setSeconds] = useState(ex.timerSeconds ?? 60)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  const total = ex.timerSeconds ?? seconds
  const pct = total ? Math.round(((total - seconds) / total) * 100) : 0

  return (
    <div className="mt-4">
      {ex.optionsSeconds && (
        <div className="mb-3 flex flex-wrap gap-2">
          {ex.optionsSeconds.map(opt => (
            <button
              key={opt}
              onClick={() => {
                setSeconds(opt)
                setRunning(false)
              }}
              className="rounded-full bg-v-dark/5 px-3 py-1 text-xs text-v-dark/80 hover:bg-v-dark/10 dark:bg-white/10 dark:text-white/85 dark:hover:bg-white/20"
            >
              {Math.round(opt / 60)}m
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-v-dark/75 dark:text-v-white/75">Progress</span>
        <span className="text-v-dark dark:text-v-white">
          {formatTime(seconds)}
        </span>
      </div>

      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10">
        <div
          className="h-full bg-v-ceil transition-all"
          style={{ width: pct + '%' }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setRunning(r => !r)}
          className="rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setRunning(false)
            setSeconds(ex.timerSeconds ?? 60)
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-v-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function IntervalSession({ ex }: { ex: Exercise }) {
  const seq = ex.intervals ?? []
  const cycles = ex.cycles ?? 1
  const [cycle, setCycle] = useState(1)
  const [idx, setIdx] = useState(0)
  const [seconds, setSeconds] = useState(seq[0]?.seconds ?? 0)
  const [running, setRunning] = useState(false)
  const current = seq[idx]

  useEffect(() => {
    if (!running || !current) return
    const t = setInterval(() => {
      setSeconds(s => {
        if (s > 1) return s - 1
        if (idx < seq.length - 1) {
          setIdx(i => i + 1)
          return seq[idx + 1].seconds
        } else {
          if (cycle < cycles) {
            setCycle(c => c + 1)
            setIdx(0)
            return seq[0].seconds
          } else {
            setRunning(false)
            return 0
          }
        }
      })
      return
    }, 1000)
    return () => clearInterval(t)
  }, [running, idx, seq, cycle, cycles, current])

  const totalSeconds = seq.reduce((a, b) => a + b.seconds, 0) * cycles
  const elapsed = () => {
    const perCycle = seq.reduce((a, b) => a + b.seconds, 0)
    const elapsedInCycles = (cycle - 1) * perCycle
    const elapsedInCurrent =
      seq.slice(0, idx).reduce((a, b) => a + b.seconds, 0) +
      ((current?.seconds ?? 0) - seconds)
    return elapsedInCycles + elapsedInCurrent
  }
  const pct = totalSeconds
    ? Math.min(100, Math.round((elapsed() / totalSeconds) * 100))
    : 0

  return (
    <div className="mt-4">
      <div className="rounded-xl bg-v-ceil/12 p-3 text-sm dark:bg-v-ceil/20">
        <div className="flex items-center justify-between">
          <span className="font-medium text-v-dark dark:text-v-white">
            {current?.label ?? 'Ready'}
          </span>
          <span className="text-v-dark dark:text-v-white">{seconds}s</span>
        </div>
        <p className="mt-1 text-xs text-v-dark/75 dark:text-v-white/75">
          Cycle {cycle} of {cycles}
        </p>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10">
        <div
          className="h-full bg-v-ceil transition-all"
          style={{ width: pct + '%' }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            if (!running && seconds === 0 && seq.length) setSeconds(seq[0].seconds)
            setRunning(r => !r)
          }}
          className="rounded-xl bg-v-ceil px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={() => {
            setRunning(false)
            setCycle(1)
            setIdx(0)
            setSeconds(seq[0]?.seconds ?? 0)
          }}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-v-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function RepsSession({ ex }: { ex: Exercise }) {
  const goal = ex.reps ?? 10
  const [count, setCount] = useState(0)
  const pct = Math.min(100, Math.round((count / goal) * 100))

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-v-dark/75 dark:text-v-white/75">Reps</span>
        <span className="text-v-dark dark:text-v-white">
          {count} / {goal}
        </span>
      </div>

      <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-v-dark/10 dark:bg-white/10">
        <div
          className="h-full bg-v-ceil transition-all"
          style={{ width: pct + '%' }}
        />
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setCount(c => Math.min(goal, c + 1))}
          className="flex-1 rounded-xl bg-v-ceil px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
        >
          +1 Rep
        </button>
        <button
          onClick={() => setCount(0)}
          className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-v-dark ring-1 ring-v-dark/10 hover:bg-v-dark/5 dark:bg-transparent dark:text-v-white dark:ring-white/20 dark:hover:bg-white/10"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const ss = String(s % 60).padStart(2, '0')
  return `${m}:${ss}`
}
