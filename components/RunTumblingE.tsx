import React, { useEffect, useMemo, useRef, useState } from 'react'
import { TestResult } from '../app/(app)/tests/types'

const SNELLEN_DEN = [200, 160, 125, 100, 80, 63, 50, 40, 32, 25, 20, 16, 12.5, 10] as const
type AcuityVariant = 'near' | 'distance'
type Rot = 0 | 90 | 180 | 270

export function RunTumblingE({
  variant,
  pxPerMM,
  distanceCm,
  onResult,
  paused,
}: {
  variant: AcuityVariant
  pxPerMM: number | null
  distanceCm: number
  paused?: boolean
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [idx, setIdx] = useState(8) // ~20/32 start
  const [rot, setRot] = useState<Rot>(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const [showLegend, setShowLegend] = useState(false)

  const lineMM = useMemo(() => {
    const arcmin = 5
    const angleRad = (arcmin / 60) * (Math.PI / 180)
    const mm = distanceCm * 10 * Math.tan(angleRad) * (SNELLEN_DEN[idx] / 20)
    return mm
  }, [idx, distanceCm])

  const snellen = `20/${SNELLEN_DEN[idx]}`
  const logMAR = Math.log10(SNELLEN_DEN[idx] / 20)

  // Accurate px from calibration, clamped to viewport
  const [vw, vh] = [typeof window !== 'undefined' ? window.innerWidth : 375, typeof window !== 'undefined' ? window.innerHeight : 800]
  const desiredPx = pxPerMM ? Math.max(18, lineMM * pxPerMM) : 0
  const sizePx = Math.max(18, Math.min(desiredPx, Math.min(vw, vh) * 0.75))

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (paused) return
      const map: Record<string, Rot | undefined> = {
        ArrowRight: 0,
        ArrowDown: 90,
        ArrowLeft: 180,
        ArrowUp: 270,
      }
      const r = map[e.key]
      if (r !== undefined) {
        e.preventDefault()
        judge(r === rot)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rot, paused])

  const judge = (correct: boolean) => {
    setHistory((h) => [...h, `${SNELLEN_DEN[idx]}:${correct ? '✓' : '✗'}`])
    if (correct) {
      const nextStreak = correctStreak + 1
      setCorrectStreak(nextStreak)
      if (nextStreak >= 2) {
        setIdx((i) => Math.min(i + 1, SNELLEN_DEN.length - 1))
        setCorrectStreak(0)
      }
    } else {
      setIdx((i) => Math.max(i - 1, 0))
      setCorrectStreak(0)
    }
    setRot(([0, 90, 180, 270] as const)[Math.floor(Math.random() * 4)])
  }

  useEffect(() => {
    const onSave = () => record()
    window.addEventListener('visionary:save-active-test', onSave as any)
    return () => window.removeEventListener('visionary:save-active-test', onSave as any)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history, idx, logMAR])

  const record = () =>
    onResult({
      id: variant === 'near' ? 'acuity-near' : 'acuity-distance',
      value: snellen,
      unit: `logMAR ${logMAR.toFixed(2)}`,
      notes: history.join(' • '),
      extra: { logMAR: Number(logMAR.toFixed(2)) },
      label: variant === 'near' ? 'Near Visual Acuity' : 'Distance Visual Acuity',
    })

  // swipe
  const start = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (paused) return
    const t = e.changedTouches[0]
    start.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (paused || !start.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.current.x
    const dy = t.clientY - start.current.y
    const absX = Math.abs(dx)
    const absY = Math.abs(dy)
    const TH = 24 // swipe threshold px
    if (absX < TH && absY < TH) return
    if (absX > absY) {
      // horizontal
      judge((dx > 0 && rot === 0) || (dx < 0 && rot === 180))
    } else {
      judge((dy > 0 && rot === 90) || (dy < 0 && rot === 270))
    }
    start.current = null
  }

  return (
    <section aria-label="Run Tumbling E" className="relative">
      {/* ARIA live for progress updates */}
      <div className="sr-only" aria-live="polite">
        {`Current ${snellen}, logMAR ${logMAR.toFixed(2)}`}
      </div>

      {!pxPerMM ? (
        <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Calibrate first for accurate letter size.
        </div>
      ) : null}

      <div
        className="relative grid min-h-[60svh] place-items-center rounded-2xl border border-white/10 bg-black/30"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <TumblingE sizePx={sizePx} rotation={rot} muted={!!paused} />

        {/* Minimal progress bar */}
        <div className="pointer-events-none absolute inset-x-4 top-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-[#6592E1] transition-[width]"
              style={{ width: `${(idx / (SNELLEN_DEN.length - 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span>{variant === 'near' ? 'Near' : 'Distance'} — {snellen} · logMAR {logMAR.toFixed(2)}</span>
            {paused ? <span className="rounded bg-white/10 px-2 py-[2px]">Paused</span> : null}
          </div>
        </div>

        {/* Large tap buttons */}
        {!paused && (
          <div className="pointer-events-auto absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-3">
            <Tap keyName="←" onClick={() => judge(rot === 180)} ariaLabel="E left" />
            <Tap keyName="↑" onClick={() => judge(rot === 270)} ariaLabel="E up" />
            <Tap keyName="↓" onClick={() => judge(rot === 90)} ariaLabel="E down" />
            <Tap keyName="→" onClick={() => judge(rot === 0)} ariaLabel="E right" />
          </div>
        )}
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium">Show legend / instructions</summary>
        <p className="mt-1 text-sm text-slate-300">
          Set distance to <strong>{variant === 'near' ? '40 cm' : '200–300 cm'}</strong>.
          Cover the non‑tested eye. Identify the E orientation by swiping or tapping a direction.
          The test adapts after each response (2‑down / 1‑up ladder).
        </p>
      </details>

      {/* Desktop save button (mobile has sticky Save) */}
      <div className="mt-4 hidden sm:block">
        <button
          className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white"
          onClick={record}
        >
          Save result
        </button>
      </div>
    </section>
  )
}

function TumblingE({ sizePx, rotation, muted }: { sizePx: number; rotation: 0 | 90 | 180 | 270; muted: boolean }) {
  const s = Math.round(sizePx || 80)
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${rotation}deg)`, opacity: muted ? 0.25 : 1, transition: 'opacity 160ms ease-out' }}
      aria-label="Tumbling E stimulus"
      role="img"
    >
      <rect x="10" y="10" width="20" height="80" fill="currentColor" />
      <rect x="10" y="10" width="60" height="20" fill="currentColor" />
      <rect x="10" y="40" width="50" height="20" fill="currentColor" />
      <rect x="10" y="70" width="60" height="20" fill="currentColor" />
    </svg>
  )
}

function Tap({ keyName, onClick, ariaLabel }: { keyName: string; onClick: () => void; ariaLabel: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/10 py-3 text-lg font-semibold"
      style={{ minHeight: 48, minWidth: 64 }}
    >
      {keyName}
    </button>
  )
}
