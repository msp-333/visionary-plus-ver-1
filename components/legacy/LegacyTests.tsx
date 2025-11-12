'use client'

import React, { useMemo, useState, useEffect } from 'react'
import { BRAND, TestResult } from '../../app/(app)/tests/types'

/**
 * Legacy Tests (unchanged logic, UI lightly harmonized to dark theme)
 * Exports:
 *  - ContrastTest, AmslerGrid, AstigmatismDial, Duochrome, ColorArrangement,
 *    ReadingSpeed, NPC, Accommodation, GlareSensitivity, EyeDominance,
 *    Worth4Dot, Stereopsis, VisualField, OSDI, CISS, CVS, NightVision, PDRuler
 */

/* -------------------------------- 1) Contrast ------------------------------- */

export function ContrastTest({
  pxPerMM,
  distanceCm,
  onResult,
}: {
  pxPerMM: number | null
  distanceCm: number
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [contrast, setContrast] = useState(50)
  const [snellenDen, setSnellenDen] = useState<number>(40)

  const sizePx = useMemo(() => {
    if (!pxPerMM) return 100
    const arcmin = 5
    const angleRad = (arcmin / 60) * (Math.PI / 180)
    const mm = distanceCm * 10 * Math.tan(angleRad) * (snellenDen / 20)
    return Math.max(40, mm * pxPerMM)
  }, [pxPerMM, distanceCm, snellenDen])

  const logCS = useMemo(() => {
    const c = Math.max(1, Math.min(99, contrast)) / 100
    return Math.log10(1 / c)
  }, [contrast])

  const save = () =>
    onResult({
      id: 'contrast',
      value: logCS.toFixed(2),
      unit: 'logCS',
      notes: `Method-of-adjustment @ 20/${snellenDen} (contrast ${contrast}%)`,
      extra: { contrastPct: contrast, letter: `20/${snellenDen}` },
      label: 'Contrast Sensitivity',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">
        Keep distance at <b>{distanceCm} cm</b>. Lower the slider until the letter is just barely readable. Save that point.
        You can change letter size (recommend 20/40).
      </p>
      {!pxPerMM ? (
        <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
          Calibrate first for consistent sizing.
        </div>
      ) : null}
      <div className="my-6 flex flex-col items-center gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-8">
          <span
            className="block font-[900] leading-none tracking-tight"
            style={{ fontSize: sizePx * 0.7, opacity: contrast / 100 }}
          >
            C
          </span>
        </div>
        <input aria-label="Contrast" type="range" min={1} max={99} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
        <div className="flex items-center gap-3 text-sm">
          <label>Letter size</label>
          <select
            className="rounded-md border border-white/10 bg-white/5 p-2"
            value={snellenDen}
            onChange={(e) => setSnellenDen(Number(e.target.value))}
          >
            {[40, 32, 25, 20].map((d) => (
              <option key={d} value={d}>20/{d}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400">Result (logCS): <b>{logCS.toFixed(2)}</b></span>
        </div>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save result</button>
      </div>
    </div>
  )
}

/* -------------------------------- 2) Amsler -------------------------------- */

export function AmslerGrid({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [flags, setFlags] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const n = 21
  const size = 320
  const step = size / (n - 1)

  const toggle = (i: number, j: number) => {
    const k = `${i},${j}`
    setFlags((f) => {
      const nextFlags = new Set(f)
      nextFlags.has(k) ? nextFlags.delete(k) : nextFlags.add(k)
      return nextFlags
    })
  }

  const save = () =>
    onResult({
      id: 'amsler',
      value: flags.size ? `${flags.size} cells flagged` : 'No distortion flagged',
      notes,
      label: 'Amsler Grid',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">
        Wear your near correction. At 30–40 cm, cover one eye and fixate the center dot. Tap any squares that look wavy or missing.
      </p>
      <div className="my-3 flex flex-col items-center gap-3">
        <svg width={size} height={size} className="rounded-md bg-white/5">
          {[...Array(n)].map((_, i) => (
            <line key={`v${i}`} x1={i * step} y1={0} x2={i * step} y2={size} stroke="currentColor" strokeOpacity={0.2} />
          ))}
          {[...Array(n)].map((_, j) => (
            <line key={`h${j}`} x1={0} y1={j * step} x2={size} y2={j * step} stroke="currentColor" strokeOpacity={0.2} />
          ))}
          <circle cx={size / 2} cy={size / 2} r={3} fill="currentColor" />
          {[...flags].map((k) => {
            const [i, j] = k.split(',').map(Number)
            return <rect key={k} x={i * step} y={j * step} width={step} height={step} fill="currentColor" fillOpacity={0.12} />
          })}
          {[...Array(n - 1)].map((_, i) =>
            [...Array(n - 1)].map((__, j) => (
              <rect
                key={`${i}-${j}`}
                x={i * step}
                y={j * step}
                width={step}
                height={step}
                fill="transparent"
                onClick={() => toggle(i, j)}
              />
            )),
          )}
        </svg>
        <textarea
          className="max-w-md rounded-md border border-white/10 bg-white/5 p-2 text-sm"
          rows={3}
          placeholder="Describe where/what you noticed…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save notes</button>
      </div>
    </div>
  )
}

/* ----------------------------- 3) Astigmatism ------------------------------ */

export function AstigmatismDial({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [deg, setDeg] = useState(0)
  const [sev, setSev] = useState(1)
  const save = () =>
    onResult({
      id: 'astigmatism',
      value: `${deg}°`,
      notes: `perceived severity ${sev}/5`,
      extra: { severity: sev },
      label: 'Astigmatism Dial',
    })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Cover one eye. Which spoke direction looks darkest or sharpest? Pick the angle and rate severity.</p>
      <div className="my-4 flex flex-col items-center gap-3">
        <DialSVG />
        <div className="flex w-full max-w-sm items-center gap-3 text-sm">
          <label className="w-28">Angle</label>
          <input className="w-full" type="range" min={0} max={180} value={deg} onChange={(e) => setDeg(Number(e.target.value))} />
          <span className="w-10 text-right">{deg}°</span>
        </div>
        <div className="flex w-full max-w-sm items-center gap-3 text-sm">
          <label className="w-28">Severity</label>
          <input className="w-full" type="range" min={1} max={5} value={sev} onChange={(e) => setSev(Number(e.target.value))} />
          <span className="w-10 text-right">{sev}/5</span>
        </div>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
      </div>
    </div>
  )
}

function DialSVG() {
  const rays = 24
  const size = 260
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 10
  const lines = [...Array(rays)].map((_, i) => {
    const a = (i / rays) * Math.PI
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="currentColor" strokeWidth={1.5} />
  })
  return (
    <svg width={size} height={size} className="rounded-md bg-white/5 p-2">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} />
      {lines}
    </svg>
  )
}

/* ------------------------------- 4) Duochrome ------------------------------ */

export function Duochrome({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [answer, setAnswer] = useState<'red' | 'green' | 'same' | ''>('')
  const save = () => answer && onResult({ id: 'duochrome', value: answer, label: 'Duochrome' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">After acuity, cover one eye. Which side’s letters look darker/sharper — red, green, or the same?</p>
      <div className="my-4 overflow-hidden rounded-lg border border-white/10">
        <div className="grid grid-cols-2">
          <div className="flex items-center justify-center bg-[#CC0000] p-6 text-white">
            <span className="text-5xl font-black tracking-tight">R</span>
          </div>
          <div className="flex items-center justify-center bg-[#008A00] p-6 text-white">
            <span className="text-5xl font-black tracking-tight">G</span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(['red', 'green', 'same'] as const).map((x) => (
          <button key={x} className={'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 ' + (answer === x ? 'ring-2 ring-[#6592E1]' : '')} onClick={() => setAnswer(x)}>{x}</button>
        ))}
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" disabled={!answer} onClick={save}>Save</button>
      </div>
    </div>
  )
}

/* ------------------------- 5) Color Arrangement (D15) ---------------------- */

export function ColorArrangement({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const initial = useMemo(() => shuffle(makeHueList()), [])
  const [caps, setCaps] = useState(initial)

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx))
  }
  const onDrop = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    const from = Number(e.dataTransfer.getData('text/plain'))
    if (Number.isNaN(from)) return
    const next = [...caps]
    const [moved] = next.splice(from, 1)
    next.splice(idx, 0, moved)
    setCaps(next)
  }

  const score = useMemo(() => crossings(caps.map((c) => c.h)), [caps])
  const save = () =>
    onResult({
      id: 'color-arrangement',
      value: `${score}`,
      unit: 'crossings (lower is better)',
      label: 'Color Arrangement',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Drag the caps to form the smoothest hue gradient. Result is a roughness score for self-tracking (lower is better).</p>
      <div className="mt-4 grid grid-cols-8 gap-2 sm:grid-cols-12">
        {caps.map((c, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, i)}
            className="aspect-square cursor-move rounded-md border border-white/10 shadow-sm transition hover:scale-[1.03]"
            title={`Hue ${Math.round(c.h)}`}
            style={{ background: `hsl(${c.h} 85% ${c.l}%)` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span>Score: {score}</span>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
      </div>
    </div>
  )
}

function makeHueList() {
  const hues = [0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336]
  return hues.map((h) => ({ h, l: 55 }))
}
function shuffle<T>(a: T[]): T[] {
  const x = [...a]
  for (let i = x.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[x[i], x[j]] = [x[j], x[i]]
  }
  return x
}
function crossings(seq: number[]) {
  let c = 0
  for (let i = 1; i < seq.length - 1; i++) {
    if (!((seq[i - 1] <= seq[i] && seq[i] <= seq[i + 1]) || (seq[i - 1] >= seq[i] && seq[i] >= seq[i + 1]))) c++
  }
  return c
}

/* ---------------------------- 6) Reading Speed ----------------------------- */

export function ReadingSpeed({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [running, setRunning] = useState(false)
  const [start, setStart] = useState<number | null>(null)
  const [text, setText] = useState(sampleText)
  const [wpm, setWpm] = useState<number | null>(null)
  const [errors, setErrors] = useState(0)
  const [strain, setStrain] = useState(3)
  const words = useMemo(() => text.trim().split(/\s+/).length, [text])

  const begin = () => {
    setWpm(null)
    setRunning(true)
    setStart(Date.now())
  }
  const end = () => {
    if (!start) return
    const minutes = (Date.now() - start) / 60000
    const result = Math.round(words / minutes)
    setWpm(result)
    setRunning(false)
  }
  const save = () =>
    wpm &&
    onResult({
      id: 'reading-speed',
      value: String(wpm),
      unit: 'WPM',
      notes: `errors ${errors}, strain ${strain}/10`,
      extra: { errors, strain },
      label: 'Reading Speed',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Tap start, read once at a comfortable pace, then tap stop. Enter errors (skips/misreads) and rate perceived strain.</p>
      <div className="mb-3 mt-2 flex flex-wrap items-center gap-2 text-sm">
        {!running ? <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1" onClick={begin}>Start</button> : <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1" onClick={end}>Stop</button>}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300">Errors</label>
          <input className="w-20 rounded-md border border-white/10 bg-white/5 p-2 text-sm" type="number" min={0} value={errors} onChange={(e) => setErrors(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-300">Strain</label>
          <input type="range" min={0} max={10} value={strain} onChange={(e) => setStrain(Number(e.target.value))} />
          <span className="text-xs">{strain}/10</span>
        </div>
        {wpm ? (
          <>
            <span>Result: <b>{wpm} WPM</b></span>
            <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
          </>
        ) : null}
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm leading-relaxed">
        {text}
      </div>
    </div>
  )
}

const sampleText =
  'Staring at screens for long periods can reduce blink rate, which may lead to temporary dryness and blur. Short, frequent breaks and gentle focusing exercises can help maintain comfort during near work.'

/* ------------------------------ 7) NPC ------------------------------------- */

export function NPC({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [t, setT] = useState<(number | '')[]>(['', '', ''])
  const worst = Math.max(...t.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x)))
  const save = () => Number.isFinite(worst) && onResult({ id: 'npc', value: `${worst}`, unit: 'cm (worst of 3)', label: 'NPC' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Move a small target slowly toward your nose until it doubles or blurs. Measure nose-to-target (cm). Repeat 3×; record the <em>worst</em> value.</p>
      <div className="mt-3 grid max-w-md grid-cols-3 gap-2 text-sm">
        {t.map((v, i) => (
          <input key={i} className="rounded-md border border-white/10 bg-white/5 p-2 text-sm" type="number" min={1} step={0.5} placeholder={`Trial ${i + 1} (cm)`} value={v} onChange={(e) => setT(swapAt(t, i, numOrEmpty(e.target.value)))} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span>Worst of 3: {Number.isFinite(worst) ? `${worst} cm` : '—'}</span>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save} disabled={!Number.isFinite(worst as number)}>Save</button>
      </div>
    </div>
  )
}

/* --------------------------- 8) Accommodation ------------------------------ */

export function Accommodation({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [nearCm, setNearCm] = useState<number | ''>('')
  const diopters = typeof nearCm === 'number' && nearCm > 0 ? Math.round((100 / nearCm) * 10) / 10 : null
  const save = () => diopters && onResult({ id: 'accommodation', value: String(diopters), unit: 'D', notes: `closest clear ${nearCm} cm`, label: 'Accommodation Amplitude' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Move a small target toward the tested eye until it first blurs. Measure the closest clear distance (cm). Amplitude ≈ 100 / cm.</p>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <input className="w-40 rounded-md border border-white/10 bg-white/5 p-2 text-sm" type="number" min={2} step={0.5} placeholder="Closest clear (cm)" value={nearCm} onChange={(e) => setNearCm(numOrEmpty(e.target.value))} />
        <span>Amplitude: {diopters ? <b>{diopters} D</b> : '—'}</span>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save} disabled={!diopters}>Save</button>
      </div>
    </div>
  )
}

/* ------------------------------- 9) Glare ---------------------------------- */

export function GlareSensitivity({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [a, setA] = useState(60) // baseline
  const [b, setB] = useState(40) // with glare
  const save = () =>
    onResult({
      id: 'glare',
      value: `${(a - b).toFixed(0)}`,
      unit: 'Δ (higher = more impact)',
      notes: `no glare ${a} vs glare ${b}`,
      label: 'Glare/Photophobia',
    })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Adjust each slider to the lowest intensity where the letter is still readable.</p>
      <div className="my-4 grid gap-6 sm:grid-cols-2">
        <GlarePlate label="No glare" value={a} onChange={setA} glare={0} />
        <GlarePlate label="With glare" value={b} onChange={setB} glare={1} />
      </div>
      <div className="text-sm">Impact Δ: <b>{(a - b).toFixed(0)}</b></div>
      <button className="mt-2 rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
    </div>
  )
}

function GlarePlate({ label, value, onChange, glare }: { label: string; value: number; onChange: (v: number) => void; glare: 0 | 1 }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs text-slate-300">{label}</div>
      <div
        className="flex h-56 w-56 items-center justify-center rounded-full"
        style={{
          background:
            glare === 1
              ? `radial-gradient(circle, rgba(255,255,255,${value / 100}) 0%, rgba(255,255,255,${value / 200}) 40%, rgba(0,0,0,1) 80%)`
              : `radial-gradient(circle, rgba(0,0,0,1) 80%, rgba(0,0,0,1) 100%)`,
        }}
      >
        <span className="text-6xl font-black text-white drop-shadow">A</span>
      </div>
      <input aria-label={`${label} intensity`} type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

/* --------------------------- 10) Eye Dominance ----------------------------- */

export function EyeDominance({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [ans, setAns] = useState<'OD' | 'OS' | ''>('')
  const save = () => ans && onResult({ id: 'eye-dominance', value: ans, label: 'Eye Dominance' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">
        Extend arms, make a small triangular aperture with your hands, and center the on-screen ✦ star.
        Close one eye at a time — which eye keeps the star centered? That’s your dominant eye.
      </p>
      <div className="my-5 flex items-center justify-center">
        <div className="grid h-40 w-40 place-items-center rounded-full border border-dashed border-white/20">
          <span className="text-4xl">✦</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className={'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 ' + (ans === 'OD' ? 'ring-2 ring-[#6592E1]' : '')} onClick={() => setAns('OD')}>Right (OD)</button>
        <button className={'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 ' + (ans === 'OS' ? 'ring-2 ring-[#6592E1]' : '')} onClick={() => setAns('OS')}>Left (OS)</button>
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" disabled={!ans} onClick={save}>Save</button>
      </div>
    </div>
  )
}

/* ---------------------------- 11) Worth 4-Dot ------------------------------ */

export function Worth4Dot({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [seen, setSeen] = useState<'2 red' | '3 green' | '4 mixed' | '5 double' | ''>('')
  const save = () => seen && onResult({ id: 'worth-4-dot', value: seen, label: 'Worth 4-Dot' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">With red-green glasses on, report how many dots and which colors you see.</p>
      <div className="my-4 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-6">
          <Dot color="#ff2a2a" />
          <Dot color="#2aff2a" />
          <Dot color="#2aff2a" />
          <Dot color="#ffffff" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(['2 red', '3 green', '4 mixed', '5 double'] as const).map((o) => (
          <button key={o} className={'rounded-md border border-white/10 bg-white/5 px-3 py-1.5 ' + (seen === o ? 'ring-2 ring-[#6592E1]' : '')} onClick={() => setSeen(o)}>{o}</button>
        ))}
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" disabled={!seen} onClick={save}>Save</button>
      </div>
    </div>
  )
}
function Dot({ color }: { color: string }) {
  return <div className="h-10 w-10 rounded-full border border-white/20" style={{ background: color }} />
}

/* ----------------------------- 12) Stereopsis ------------------------------ */

export function Stereopsis({
  pxPerMM,
  distanceCm,
  onResult,
}: {
  pxPerMM: number | null
  distanceCm: number
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [levelIdx, setLevelIdx] = useState(0)
  const [hitThreshold, setHitThreshold] = useState<number | null>(null)
  const arcsecLevels = [600, 300, 200, 150, 100, 60]

  const disparityPx = (arcsec: number) => {
    if (!pxPerMM) return 2
    const rad = (arcsec / 3600) * (Math.PI / 180)
    const mmOffset = distanceCm * 10 * Math.tan(rad)
    return Math.max(1, Math.round(mmOffset * pxPerMM))
  }

  const answer = (correct: boolean) => {
    if (correct) {
      const next = levelIdx + 1
      if (next >= arcsecLevels.length) setHitThreshold(arcsecLevels[levelIdx])
      else setLevelIdx(next)
    } else {
      setHitThreshold(arcsecLevels[levelIdx] || arcsecLevels[arcsecLevels.length - 1])
    }
  }

  const save = () =>
    hitThreshold &&
    onResult({
      id: 'stereopsis',
      value: `${hitThreshold}`,
      unit: 'arcsec (approx)',
      notes: `min disparity recognized: ${hitThreshold}"`,
      extra: { arcsec: hitThreshold },
      label: 'Stereopsis',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Wear red-cyan glasses (red left). Identify which circle appears “in front”. Levels decrease disparity (arcsec).</p>
      {!pxPerMM ? (
        <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
          Calibrate first for disparity accuracy.
        </div>
      ) : null}
      <div className="my-4 grid place-items-center gap-3">
        <StereoTriplet pxOffset={disparityPx(arcsecLevels[levelIdx])} onPick={answer} />
        <div className="text-xs text-slate-400">Level: ~{arcsecLevels[levelIdx]}" ({disparityPx(arcsecLevels[levelIdx])} px)</div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5" onClick={() => answer(true)}>I picked correctly</button>
          <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5" onClick={() => answer(false)}>I picked wrong / unsure</button>
          {hitThreshold ? <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button> : null}
        </div>
      </div>
    </div>
  )
}

function StereoTriplet({ pxOffset, onPick }: { pxOffset: number; onPick: (correct: boolean) => void }) {
  const target = Math.floor(Math.random() * 3)
  const radius = 24
  const gap = 40
  return (
    <div className="flex items-center justify-center gap-10">
      {[0, 1, 2].map((i) => (
        <div key={i} className="cursor-pointer rounded-md p-2 hover:bg-white/10" onClick={() => onPick(i === target)}>
          <svg width={radius * 2 + gap} height={radius * 2}>
            <circle cx={radius + (i === target ? -pxOffset : 0)} cy={radius} r={radius} fill="rgba(0,255,255,0.7)" />
            <circle cx={radius + (i === target ? pxOffset : 0)} cy={radius} r={radius} fill="rgba(255,0,0,0.7)" />
            <circle cx={radius} cy={radius} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.25} />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* --------------------------- 13) Visual Field ------------------------------ */

export function VisualField({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [running, setRunning] = useState(false)
  const [trial, setTrial] = useState(0)
  const [hits, setHits] = useState<number>(0)
  const total = 24
  const positions = useMemo(() => {
    const pts: { x: number; y: number }[] = []
    const r = 120
    const r2 = 80
    for (let a = 0; a < 360; a += 45) {
      const rad = (a * Math.PI) / 180
      pts.push({ x: r * Math.cos(rad), y: r * Math.sin(rad) })
    }
    for (let a = 0; a < 360; a += 60) {
      const rad = (a * Math.PI) / 180
      pts.push({ x: r2 * Math.cos(rad), y: r2 * Math.sin(rad) })
    }
    pts.push({ x: 40, y: 0 }, { x: -40, y: 0 }, { x: 0, y: 40 }, { x: 0, y: -40 })
    return pts.slice(0, total)
  }, [])

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    let to: ReturnType<typeof setTimeout> | undefined
    if (running) {
      to = setTimeout(() => {
        setCurrent((c) => (c + 1) % total)
        setTrial((t) => t + 1)
      }, 900)
    }
    return () => {
      if (to !== undefined) clearTimeout(to)
    }
  }, [running, trial, total])

  const press = () => {
    if (!running) return
    setHits((h) => h + 1)
    setCurrent((c) => (c + 1) % total)
    setTrial((t) => t + 1)
  }

  const start = () => {
    setRunning(true)
    setTrial(0)
    setHits(0)
  }
  const stop = () => setRunning(false)

  const save = () =>
    onResult({
      id: 'visual-field',
      value: `${Math.round((hits / Math.max(1, trial)) * 100)}`,
      unit: '% seen (screening)',
      notes: `${hits}/${trial} seen`,
      label: 'Visual Field (screening)',
    })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Fixate the center +. Press <b>Space</b> or tap “Saw it” whenever you notice a flash in the periphery.</p>
      <div className="my-4 grid place-items-center gap-3">
        <div className="relative h-64 w-64 rounded-md border border-white/10">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl">+</div>
          {running ? (
            <div
              className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                transform: `translate(${positions[current].x}px, ${positions[current].y}px)`,
                background: 'white',
                boxShadow: '0 0 0 3px ' + BRAND.ceil,
              }}
            />
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {!running ? (
            <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5" onClick={start}>Start</button>
          ) : (
            <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5" onClick={stop}>Stop</button>
          )}
          <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={press} disabled={!running}>Saw it</button>
          <span className="text-xs text-slate-400">Hits: {hits} / {trial}</span>
          {!running && trial > 0 ? <button className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5" onClick={save}>Save</button> : null}
        </div>
      </div>
      <KeyCapture active={running} onSpace={press} />
    </div>
  )
}

function KeyCapture({ active, onSpace }: { active: boolean; onSpace: () => void }) {
  useEffect(() => {
    if (!active) return
    const h = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        onSpace()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [active, onSpace])
  return null
}

/* -------------------- 14) OSDI, 15) CISS, 16) CVS, 17) Night --------------- */

export function OSDI({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [scores, setScores] = useState<Record<number, number | ''>>({})
  const items = [
    'Eyes that are sensitive to light?',
    'Eyes that feel gritty?',
    'Painful or sore eyes?',
    'Blurred vision?',
    'Poor vision?',
    'Reading?',
    'Driving at night?',
    'Working with a computer or bank machine (ATM)?',
    'Watching TV?',
    'Windy conditions?',
    'Places or areas with low humidity (very dry)?',
    'Areas that are air conditioned?',
  ]
  const answered = Object.values(scores).filter((v) => v !== '').length
  const sum = Object.values(scores).reduce<number>((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
  const osdi = answered ? (sum * 25) / answered : 0
  const save = () => onResult({ id: 'osdi', value: osdi.toFixed(1), unit: '0–100', notes: `${answered}/12 answered`, label: 'OSDI' })

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Rate frequency over the last week (0=none, 4=all the time).</p>
      <table className="mt-2 w-full text-sm">
        <tbody>
          {items.map((q, i) => (
            <tr key={i} className="border-t border-white/10">
              <td className="py-2 pr-2">{q}</td>
              <td className="w-48">
                <select
                  className="w-full rounded-md border border-white/10 bg-white/5 p-2 text-sm"
                  value={scores[i] ?? ''}
                  onChange={(e) => setScores((s) => ({ ...s, [i]: e.target.value === '' ? '' : Number(e.target.value) }))}
                >
                  <option value="">—</option>
                  {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-sm">Score: <b>{osdi.toFixed(1)}</b> / 100</div>
      <button className="mt-2 rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save} disabled={!answered}>Save</button>
    </div>
  )
}

export function CISS({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const questions = [
    'Do your eyes feel tired when reading or doing close work?',
    'Do your eyes feel uncomfortable when reading or doing close work?',
    'Do you have headaches when reading or doing close work?',
    'Do you feel sleepy when reading or doing close work?',
    'Do you lose concentration when reading or doing close work?',
    'Do you have trouble remembering what you have read?',
    'Do you read slowly?',
    'Do your eyes ever hurt when reading?',
    'Do your eyes ever feel sore when reading?',
    'Do you feel a “pulling” feeling around your eyes when reading?',
    'Do you notice the words move, jump, swim, or appear to float on the page?',
    'Do you experience double vision when reading or doing close work?',
    'Do you have to re-read the same line of words when reading?',
    'Do you get headaches when reading or doing close work?',
    'Do you feel that you read slowly?',
  ]
  const [scores, setScores] = useState<number[]>(Array(questions.length).fill(0))
  const total = scores.reduce((a, b) => a + b, 0)
  const save = () => onResult({ id: 'ciss', value: String(total), unit: 'raw score', label: 'CISS' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Rate frequency (0=never, 1=rarely, 2=sometimes, 3=frequently, 4=always).</p>
      <div className="mt-2 grid gap-2">
        {questions.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-white/10 pt-2 text-sm">
            <span>{q}</span>
            <select className="rounded-md border border-white/10 bg-white/5 p-2 text-sm" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
    </div>
  )
}

export function CVS({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [habit, setHabit] = useState(0)
  const items = ['Dryness', 'Burning', 'Headache', 'Blur after screen', 'Double vision', 'Neck/shoulder pain', 'Light sensitivity']
  const [scores, setScores] = useState<number[]>(Array(items.length).fill(0))
  const total = scores.reduce((a, b) => a + b, 0)
  const save = () => onResult({ id: 'cvs', value: String(total), unit: 'symptom score', notes: `20-20-20 adherence ${habit}/7 days`, label: 'CVS / 20-20-20' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Rate last-week symptom frequency (0–4). Log how many days you did the 20-20-20 rule.</p>
      <div className="grid gap-2">
        {items.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-white/10 pt-2 text-sm">
            <span>{q}</span>
            <select className="rounded-md border border-white/10 bg-white/5 p-2 text-sm" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
        <div className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-white/10 pt-2 text-sm">
          <span>20-20-20 days (out of 7)</span>
          <input className="rounded-md border border-white/10 bg-white/5 p-2 text-sm" type="number" min={0} max={7} value={habit} onChange={(e) => setHabit(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
    </div>
  )
}

export function NightVision({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const items = ['Halos around lights', 'Glare from headlights', 'Difficulty reading street signs', 'Washed out contrast', 'Need more light than others', 'Slower dark adaptation']
  const [scores, setScores] = useState<number[]>(Array(items.length).fill(0))
  const total = scores.reduce((a, b) => a + b, 0)
  const save = () => onResult({ id: 'night-vision', value: String(total), unit: 'checklist score', label: 'Night/Low-Light' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Rate how often you notice each (0–4). Track the trend over time.</p>
      <div className="grid gap-2">
        {items.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-white/10 pt-2 text-sm">
            <span>{q}</span>
            <select className="rounded-md border border-white/10 bg-white/5 p-2 text-sm" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save}>Save</button>
    </div>
  )
}

/* -------------------------------- 18) PD Ruler ------------------------------ */

export function PDRuler({
  pxPerMM,
  onResult,
}: {
  pxPerMM: number | null
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [pd, setPd] = useState<number | ''>('')
  const save = () => typeof pd === 'number' && onResult({ id: 'pd-ruler', value: String(pd), unit: 'mm', label: 'PD' })
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-sm text-slate-300">Stand at a mirror. Hold a millimeter ruler under your eyes and measure center-to-center pupil distance. Or place a clear card against the screen ruler (calibrated).</p>
      {!pxPerMM ? (
        <div className="mt-3 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-200">
          Calibrate to show accurate on-screen mm scale.
        </div>
      ) : null}
      <div className="my-3">
        <div className="mb-2 text-xs text-slate-300">On-screen mm scale</div>
        <div className="relative h-12 rounded-md border border-white/10 bg-white/5">
          {pxPerMM
            ? [...Array(151)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0"
                  style={{ left: `${i * pxPerMM}px`, width: 1, height: i % 10 === 0 ? '60%' : '35%', background: 'currentColor', opacity: 0.5 }}
                  title={`${i} mm`}
                />
              ))
            : null}
          {pxPerMM ? <div className="absolute left-2 top-1 text-[10px] opacity-60">0 mm</div> : null}
          {pxPerMM ? <div className="absolute right-2 top-1 text-[10px] opacity-60">150 mm</div> : null}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <input
          className="w-40 rounded-md border border-white/10 bg-white/5 p-2 text-sm"
          type="number"
          min={45}
          max={80}
          placeholder="Enter PD (mm)"
          value={pd}
          onChange={(e) => setPd(numOrEmpty(e.target.value))}
        />
        <button className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white" onClick={save} disabled={!(typeof pd === 'number')}>Save</button>
      </div>
    </div>
  )
}

/* ------------------------------ Shared helpers ----------------------------- */

function swapAt<T>(arr: T[], i: number, v: T) {
  const x = [...arr]
  x[i] = v
  return x
}
function numOrEmpty(v: string): number | '' {
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}
