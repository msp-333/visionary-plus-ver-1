'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

/**
 * Visionary+ Tests — v2
 * - Sorted groups: Score-based, Self-assessment/Notes, Accessories
 * - Exam Mode, per-eye capture, improved calibration & delivery
 * - Local persistence + CSV export
 *
 * No external libs. Tailwind classes are optional (harmless if not present).
 * DISCLAIMER: Screening & self-tracking only — not a medical diagnosis or prescription.
 */

/* ----------------------------- Types & Registry ---------------------------- */

type Eye = 'OD' | 'OS' | 'OU'
type Category = 'score' | 'self' | 'accessory'

type TestId =
  | 'acuity-near'
  | 'acuity-distance'
  | 'contrast'
  | 'amsler'
  | 'astigmatism'
  | 'duochrome'
  | 'color-arrangement'
  | 'reading-speed'
  | 'npc'
  | 'accommodation'
  | 'glare'
  | 'eye-dominance'
  | 'worth-4-dot'
  | 'stereopsis'
  | 'visual-field'
  | 'osdi'
  | 'ciss'
  | 'cvs'
  | 'night-vision'
  | 'pd-ruler'

type TestMeta = {
  id: TestId
  label: string
  category: Category
  short: string
  notes?: string
  needsCalibration?: boolean
  needsDistance?: boolean
}

type TestResult = {
  id: TestId
  label: string
  category: Category
  eye: Eye
  value: string
  unit?: string
  notes?: string
  extra?: Record<string, string | number | boolean>
  distanceCm?: number
  timestamp: number
}

const TESTS: TestMeta[] = [
  /* Score-based */
  { id: 'acuity-near', label: 'Near Visual Acuity (Tumbling E)', category: 'score', short: 'Sharpness at 40 cm', needsCalibration: true, needsDistance: true },
  { id: 'acuity-distance', label: 'Distance Visual Acuity (Tumbling E)', category: 'score', short: 'Sharpness at 2–3 m', needsCalibration: true, needsDistance: true },
  { id: 'contrast', label: 'Contrast Sensitivity (letter threshold)', category: 'score', short: 'Low-contrast seeing', needsCalibration: true, needsDistance: true },
  { id: 'color-arrangement', label: 'Color Arrangement (Mini D‑15 style)', category: 'score', short: 'Color ordering error score' },
  { id: 'reading-speed', label: 'Reading Speed & Comfort', category: 'score', short: 'WPM + strain' },
  { id: 'npc', label: 'Near Point of Convergence (NPC)', category: 'score', short: 'Alignment endurance (cm)' },
  { id: 'accommodation', label: 'Accommodation Amplitude (Push‑Up)', category: 'score', short: 'Focusing power (D)' },
  { id: 'glare', label: 'Glare/Photophobia Threshold', category: 'score', short: 'With vs without glare' },

  /* Self-assessment & notes */
  { id: 'amsler', label: 'Amsler Grid (macular distortion)', category: 'self', short: 'Mark distortions' },
  { id: 'astigmatism', label: 'Astigmatism Dial (clock test)', category: 'self', short: 'Darker/thicker spokes angle' },
  { id: 'duochrome', label: 'Red‑Green Duochrome Balance', category: 'self', short: 'Focus bias after acuity' },
  { id: 'eye-dominance', label: 'Eye Dominance (Miles/Cardhole style)', category: 'self', short: 'Dominant eye' },
  { id: 'visual-field', label: 'Visual Field Screener (suprathreshold)', category: 'self', short: 'Peripheral hit-map' },
  { id: 'pd-ruler', label: 'PD Ruler (manual, calibrated)', category: 'self', short: 'Interpupillary distance' },

  /* Accessories */
  { id: 'stereopsis', label: 'Stereopsis (Depth, Red‑Cyan)', category: 'accessory', short: 'Depth threshold (arcsec)', needsCalibration: true, needsDistance: true },
  { id: 'worth-4-dot', label: 'Worth 4‑Dot (Red‑Green)', category: 'accessory', short: 'Fusion / suppression' },

  /* Questionnaires */
  { id: 'osdi', label: 'OSDI (Dry Eye Symptoms)', category: 'self', short: '0–100 score (tracking)' },
  { id: 'ciss', label: 'CISS (Convergence Symptoms)', category: 'self', short: 'Raw score (tracking)' },
  { id: 'cvs', label: 'Computer Vision Syndrome / 20‑20‑20', category: 'self', short: 'Symptoms + habit' },
  { id: 'night-vision', label: 'Night/Low‑Light Difficulty', category: 'self', short: 'Checklist trend' },
]

/* --------------------------------- Helpers -------------------------------- */

function useLocalStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
    return raw ? (JSON.parse(raw) as T) : initial
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {}
  }, [key, state])
  return [state, setState] as const
}

const BRAND = {
  ceil: '#6592E1',
  dark: '#001130',
}

/* ------------------------------ Page Component ---------------------------- */

export default function TestsPage() {
  const [pxPerMM, setPxPerMM] = useLocalStorageState<number | null>('visionary:pxPerMM', null)
  const [distanceCm, setDistanceCm] = useLocalStorageState<number>('visionary:distanceCm', 40)
  const [eye, setEye] = useLocalStorageState<Eye>('visionary:eye', 'OU')
  const [category, setCategory] = useLocalStorageState<Category | 'all'>('visionary:cat', 'all')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<TestId>('acuity-near')
  const [results, setResults] = useLocalStorageState<TestResult[]>('visionary:results', [])
  const [examMode, setExamMode] = useState(false)
  const [examQueue, setExamQueue] = useState<TestId[]>([])

  const meta = TESTS.find((t) => t.id === active)!

  useEffect(() => {
    // Start Exam Mode queue (score group, sensible order)
    if (examMode) {
      const seq: TestId[] = [
        'acuity-near',
        'contrast',
        'reading-speed',
        'amsler',
        'astigmatism',
        'duochrome',
        'npc',
        'accommodation',
        'glare',
      ]
      setExamQueue(seq)
      setActive(seq[0])
    } else {
      setExamQueue([])
    }
  }, [examMode])

  const save = (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => {
    const m = TESTS.find((t) => t.id === r.id)!
    setResults((prev) => [
      { ...r, label: m.label, category: m.category, eye, distanceCm, timestamp: Date.now() },
      ...prev,
    ])
    // advance exam
    if (examMode && examQueue.length) {
      const idx = examQueue.indexOf(r.id)
      const nextId = examQueue[idx + 1]
      if (nextId) setActive(nextId)
      else setExamMode(false)
    }
  }

  const filtered = TESTS.filter(
    (t) =>
      (category === 'all' || t.category === category) &&
      (search.trim() === '' || t.label.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <main className="min-h-[100svh] w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Header />

        <CalibrationCard pxPerMM={pxPerMM} setPxPerMM={setPxPerMM} />

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
          <div className="grid gap-3 md:grid-cols-3 md:items-end">
            <EyePicker eye={eye} setEye={setEye} />
            <DistancePicker distanceCm={distanceCm} setDistanceCm={setDistanceCm} />
            <div className="flex items-center justify-between gap-3">
              <CategoryChips value={category} onChange={setCategory} />
              <label className="sr-only" htmlFor="search">Search tests</label>
              <input
                id="search"
                placeholder="Search tests…"
                className="w-44 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-[#0b1a33]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <EnvHints />
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" className="mr-2 align-middle" checked={examMode} onChange={(e) => setExamMode(e.target.checked)} />
                Exam Mode (guided sequence)
              </label>
              {examMode ? <span className="text-xs text-slate-500">Next: {TESTS.find(t => t.id === active)?.label}</span> : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
            <div className="mb-2 text-xs font-medium text-slate-900 dark:text-white">Tests</div>
            <nav className="grid gap-1">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActive(t.id)}
                  className={
                    'w-full rounded-lg px-3 py-2 text-left text-sm transition ' +
                    (active === t.id ? 'bg-[#6592E1] text-white' : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100')
                  }
                >
                  <div className="flex items-center justify-between">
                    <span>{t.label}</span>
                    <Tag>{t.category}</Tag>
                  </div>
                  {t.short ? <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{t.short}</div> : null}
                </button>
              ))}
            </nav>
          </aside>

          <section className="md:col-span-2">
            {meta?.needsCalibration && !pxPerMM ? (
              <Callout title="Calibrate first" subtitle="Use a credit card (85.6 mm) or the 1‑inch box to match your screen.">
                Size‑based tests need correct scale for accuracy.
              </Callout>
            ) : null}
            <TestHost id={active} pxPerMM={pxPerMM} distanceCm={distanceCm} eye={eye} onResult={save} />
          </section>
        </div>

        <ResultsPanel results={results} onClear={() => setResults([])} />

        <FooterNote />
      </div>
    </main>
  )
}

/* --------------------------------- Header --------------------------------- */

function Header() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
        Visionary · Tests
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        Screen‑based **screenings** to track changes over time. If you notice sudden changes or concerning results,
        please consult an eye‑care professional.
      </p>
    </div>
  )
}

function FooterNote() {
  return (
    <p className="text-xs text-slate-500/80">
      Built‑in: Near & Distance Acuity, Contrast, Amsler, Astigmatism Dial, Duochrome, Color Arrangement, Reading,
      NPC, Accommodation, Glare, Eye Dominance, Stereopsis (red‑cyan), Worth 4‑Dot (red‑green), Visual Field screener,
      OSDI, CISS, CVS, Night‑vision checklist, and PD ruler.
    </p>
  )
}

/* -------------------------------- UI atoms -------------------------------- */

function Tag({ children }: { children: React.ReactNode }) {
  const txt =
    children === 'score' ? 'Score' : children === 'self' ? 'Self' : 'Accessories'
  return (
    <span className="rounded-full border border-slate-300 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-slate-300">
      {txt}
    </span>
  )
}

function CategoryChips({ value, onChange }: { value: Category | 'all'; onChange: (v: Category | 'all') => void }) {
  const opts: (Category | 'all')[] = ['all', 'score', 'self', 'accessory']
  return (
    <div className="flex flex-wrap items-center gap-1">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={
            'rounded-full px-3 py-1 text-xs transition ' +
            (value === o ? 'bg-[#6592E1] text-white' : 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200')
          }
        >
          {o === 'all' ? 'All' : o === 'score' ? 'Score‑based' : o === 'self' ? 'Self/Notes' : 'Accessories'}
        </button>
      ))}
    </div>
  )
}

function EyePicker({ eye, setEye }: { eye: Eye; setEye: (e: Eye) => void }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-900 dark:text-white">Eye under test</div>
      <div className="mt-1 flex gap-2">
        {(['OD', 'OS', 'OU'] as Eye[]).map((e) => (
          <button
            key={e}
            onClick={() => setEye(e)}
            className={
              'rounded-md border px-3 py-1.5 text-sm transition ' +
              (eye === e
                ? 'border-transparent bg-[#6592E1] text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10')
            }
            aria-pressed={eye === e}
          >
            {e} {e === 'OD' ? '(right)' : e === 'OS' ? '(left)' : '(both)'}
          </button>
        ))}
      </div>
    </div>
  )
}

function DistancePicker({ distanceCm, setDistanceCm }: { distanceCm: number; setDistanceCm: (n: number) => void }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-900 dark:text-white">Testing distance</div>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={30}
          max={500}
          className="w-28 rounded-md border border-slate-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#0b1a33]"
          value={distanceCm}
          onChange={(e) => setDistanceCm(Number(e.target.value))}
        />
        <span className="text-xs text-slate-600 dark:text-slate-300">cm (40 for near; 200–300 for distance)</span>
      </div>
    </div>
  )
}

function Callout({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
      <div className="mb-1 text-sm font-medium text-slate-900 dark:text-white">{title}</div>
      {subtitle ? <div className="mb-2 text-xs text-slate-600 dark:text-slate-300">{subtitle}</div> : null}
      <div className="text-sm text-slate-700 dark:text-slate-200">{children}</div>
    </div>
  )
}

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium text-slate-900 dark:text-white">{title}</div>
        {right}
      </div>
      <div>{children}</div>
      <style jsx global>{`
        .btn { @apply rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10; }
        .btn-primary { @apply rounded-md bg-[#6592E1] px-3 py-1.5 text-sm font-medium text-white transition hover:brightness-110; }
        .inp { @apply w-full rounded-md border border-slate-300 bg-white p-2 text-sm dark:border-white/10 dark:bg-[#0b1a33]; }
      `}</style>
    </div>
  )
}

function Instructions({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-700 dark:text-slate-200">{children}</p>
}

function EnvHints() {
  return (
    <div className="text-[11px] text-slate-500 dark:text-slate-300">
      Tips: bright, even lighting · no screen glare · sit upright · keep the set distance · cover the non‑tested eye.
    </div>
  )
}

/* ------------------------------- Calibration ------------------------------- */

function CalibrationCard({
  pxPerMM,
  setPxPerMM,
}: {
  pxPerMM: number | null
  setPxPerMM: (v: number) => void
}) {
  const [barPx, setBarPx] = useState(300)
  const [estPxPerMM, setEstPxPerMM] = useState<number | null>(null)

  useEffect(() => {
    // Estimate px/mm via CSS inch
    const probe = document.createElement('div')
    probe.style.width = '1in'
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    document.body.appendChild(probe)
    const pxPerIn = probe.offsetWidth || 96
    document.body.removeChild(probe)
    const mm = pxPerIn / 25.4
    if (mm && Number.isFinite(mm)) setEstPxPerMM(mm)
  }, [])

  const saveFromCard = () => setPxPerMM(barPx / 85.6) // 85.6 mm card
  const setFromEstimate = () => estPxPerMM && setPxPerMM(estPxPerMM)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm font-medium text-slate-900 dark:text-white">Screen calibration</div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Use one of the methods below. Aim for <strong>precise matching</strong> — size‑based tests depend on it.
          </p>
        </div>
        <div className="text-xs text-slate-500/90">
          Scale: <b>{pxPerMM ? pxPerMM.toFixed(2) : '—'}</b> px/mm{' '}
          {pxPerMM ? (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">locked</span>
          ) : estPxPerMM ? (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">estimated</span>
          ) : null}
        </div>
      </div>

      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <div>
          <div className="mb-2 text-xs font-medium">A) Credit/ID card (85.6 mm)</div>
          <div className="rounded-md border border-slate-300 p-3 dark:border-white/10">
            <div className="relative mx-auto h-8 rounded-md border border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/10" style={{ width: barPx }} />
            <input className="mt-2 w-full" type="range" min={100} max={700} step={1} value={barPx} onChange={(e) => setBarPx(Number(e.target.value))} />
            <div className="mt-2 flex items-center justify-between text-xs">
              <span>Match this bar to your card width</span>
              <button onClick={saveFromCard} className="rounded-full bg-[#6592E1] px-3 py-1 text-white transition hover:brightness-110">Save</button>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium">B) 1‑inch box verifier</div>
          <div className="rounded-md border border-slate-300 p-3 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div style={{ width: '1in', height: '1in', border: '1px dashed currentColor' }} className="text-slate-500 dark:text-slate-300" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Place a real 1‑inch object (ruler) over the box. If it matches, click{' '}
                <button onClick={setFromEstimate} className="underline">Use estimate</button>.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium">C) Coin (optional)</div>
          <div className="rounded-md border border-slate-300 p-3 text-xs dark:border-white/10">
            <CoinCalibrator onCalibrated={(mm) => setPxPerMM(barPx /* placeholder width not used here */ / (mm || 85.6))} setPxPerMM={setPxPerMM} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CoinCalibrator({ setPxPerMM, onCalibrated }: { setPxPerMM: (v: number) => void; onCalibrated: (mm: number) => void }) {
  const [diam, setDiam] = useState(24.26) // US quarter
  const [bar, setBar] = useState(100)
  const coins = [
    { label: 'US quarter (24.26 mm)', mm: 24.26 },
    { label: '€1 coin (23.25 mm)', mm: 23.25 },
    { label: '₹10 coin (27.0 mm)', mm: 27.0 },
  ]
  const save = () => {
    const pxPerMM = bar / diam
    setPxPerMM(pxPerMM)
    onCalibrated(diam)
  }
  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <select className="inp" value={diam} onChange={(e) => setDiam(Number(e.target.value))}>
          {coins.map((c) => <option key={c.label} value={c.mm}>{c.label}</option>)}
        </select>
      </div>
      <div className="relative mx-auto h-8 rounded-md border border-slate-300 bg-slate-100 dark:border-white/10 dark:bg-white/10" style={{ width: bar }} />
      <input className="mt-2 w-full" type="range" min={60} max={180} step={1} value={bar} onChange={(e) => setBar(Number(e.target.value))} />
      <div className="mt-2 flex items-center justify-between">
        <span>Match this bar to your coin’s diameter</span>
        <button className="btn-primary" onClick={save}>Save</button>
      </div>
    </>
  )
}

/* --------------------------------- Test Host -------------------------------- */

function TestHost({
  id,
  pxPerMM,
  distanceCm,
  eye,
  onResult,
}: {
  id: TestId
  pxPerMM: number | null
  distanceCm: number
  eye: Eye
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  switch (id) {
    case 'acuity-near':
      return <AcuityTest variant="near" pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'acuity-distance':
      return <AcuityTest variant="distance" pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'contrast':
      return <ContrastTest pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'amsler':
      return <AmslerGrid onResult={onResult} />
    case 'astigmatism':
      return <AstigmatismDial onResult={onResult} />
    case 'duochrome':
      return <Duochrome onResult={onResult} />
    case 'color-arrangement':
      return <ColorArrangement onResult={onResult} />
    case 'reading-speed':
      return <ReadingSpeed onResult={onResult} />
    case 'npc':
      return <NPC onResult={onResult} />
    case 'accommodation':
      return <Accommodation onResult={onResult} />
    case 'glare':
      return <GlareSensitivity onResult={onResult} />
    case 'eye-dominance':
      return <EyeDominance onResult={onResult} />
    case 'worth-4-dot':
      return <Worth4Dot onResult={onResult} />
    case 'stereopsis':
      return <Stereopsis pxPerMM={pxPerMM} distanceCm={distanceCm} onResult={onResult} />
    case 'visual-field':
      return <VisualField onResult={onResult} />
    case 'osdi':
      return <OSDI onResult={onResult} />
    case 'ciss':
      return <CISS onResult={onResult} />
    case 'cvs':
      return <CVS onResult={onResult} />
    case 'night-vision':
      return <NightVision onResult={onResult} />
    case 'pd-ruler':
      return <PDRuler pxPerMM={pxPerMM} onResult={onResult} />
    default:
      return null
  }
}

/* --------------------------- 1/2) Visual Acuity ---------------------------- */

const SNELLEN_DEN = [200, 160, 125, 100, 80, 63, 50, 40, 32, 25, 20, 16, 12.5, 10] as const
type AcuityVariant = 'near' | 'distance'

function AcuityTest({
  variant,
  pxPerMM,
  distanceCm,
  onResult,
}: {
  variant: AcuityVariant
  pxPerMM: number | null
  distanceCm: number
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [idx, setIdx] = useState(8) // ~20/32 start
  const [rot, setRot] = useState<0 | 90 | 180 | 270>(0)
  const [correctStreak, setCorrectStreak] = useState(0)
  const [history, setHistory] = useState<string[]>([])

  const lineMM = useMemo(() => {
    // 5 arcmin at 20 ft (6 m) scaled by Snellen ratio and distance
    const arcmin = 5
    const angleRad = (arcmin / 60) * (Math.PI / 180)
    const mm = distanceCm * 10 * Math.tan(angleRad) * (SNELLEN_DEN[idx] / 20)
    return mm
  }, [idx, distanceCm])

  const px = pxPerMM ? Math.max(18, lineMM * pxPerMM) : 0
  const snellen = `20/${SNELLEN_DEN[idx]}`
  const logMAR = Math.log10(SNELLEN_DEN[idx] / 20)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, 0 | 90 | 180 | 270> = { ArrowRight: 0, ArrowDown: 90, ArrowLeft: 180, ArrowUp: 270 }
      if (map[e.key as keyof typeof map] !== undefined) {
        e.preventDefault()
        judge(map[e.key as keyof typeof map] === rot)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rot])

  const judge = (correct: boolean) => {
    setHistory((h) => [...h, `${SNELLEN_DEN[idx]}:${correct ? '✓' : '✗'}`])
    if (correct) {
      const nextStreak = correctStreak + 1
      setCorrectStreak(nextStreak)
      // 2-down / 1-up staircase (approx. 70% threshold)
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

  const record = () =>
    onResult({
      id: variant === 'near' ? 'acuity-near' : 'acuity-distance',
      value: snellen,
      unit: `logMAR ${logMAR.toFixed(2)}`,
      notes: history.join(' • '),
      extra: { logMAR: Number(logMAR.toFixed(2)) },
      label: variant === 'near' ? 'Near Visual Acuity' : 'Distance Visual Acuity',
    })

  return (
    <Card
      title={`${variant === 'near' ? 'Near' : 'Distance'} Visual Acuity (Tumbling E)`}
      right={<span className="text-xs text-slate-500">Current: {snellen} · logMAR {logMAR.toFixed(2)}</span>}
    >
      <Instructions>
        Set distance to <strong>{variant === 'near' ? '40 cm' : '200–300 cm'}</strong>.
        Cover the non-tested eye. Identify the E orientation (keyboard ↑ ↓ ← → works). The test adapts after each response.
      </Instructions>
      {!pxPerMM ? <Warn>Calibrate first for accurate letter size.</Warn> : null}
      <div className="my-6 flex flex-col items-center gap-3">
        <TumblingE sizePx={px} rotation={rot} />
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <button className="btn" onClick={() => judge(rot === 0)} aria-label="E right">→</button>
          <button className="btn" onClick={() => judge(rot === 90)} aria-label="E down">↓</button>
          <button className="btn" onClick={() => judge(rot === 180)} aria-label="E left">←</button>
          <button className="btn" onClick={() => judge(rot === 270)} aria-label="E up">↑</button>
          <button className="btn-primary" onClick={record}>Save result</button>
        </div>
      </div>
    </Card>
  )
}

function TumblingE({ sizePx, rotation }: { sizePx: number; rotation: 0 | 90 | 180 | 270 }) {
  const s = Math.round(sizePx || 80)
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ transform: `rotate(${rotation}deg)` }}>
      <rect x="10" y="10" width="20" height="80" fill="currentColor" />
      <rect x="10" y="10" width="60" height="20" fill="currentColor" />
      <rect x="10" y="40" width="50" height="20" fill="currentColor" />
      <rect x="10" y="70" width="60" height="20" fill="currentColor" />
    </svg>
  )
}

/* ----------------------------- 3) Contrast (logCS) ---------------------------- */

function ContrastTest({
  pxPerMM,
  distanceCm,
  onResult,
}: {
  pxPerMM: number | null
  distanceCm: number
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [contrast, setContrast] = useState(50) // % letter contrast (method of adjustment)
  const [snellenDen, setSnellenDen] = useState<number>(40)

  const sizePx = useMemo(() => {
    if (!pxPerMM) return 100
    const arcmin = 5
    const angleRad = (arcmin / 60) * (Math.PI / 180)
    const mm = distanceCm * 10 * Math.tan(angleRad) * (snellenDen / 20)
    return Math.max(40, mm * pxPerMM)
  }, [pxPerMM, distanceCm, snellenDen])

  const logCS = useMemo(() => {
    const c = Math.max(1, Math.min(99, contrast)) / 100 // 0.01..0.99
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
    <Card title="Contrast Sensitivity (letter threshold)">
      <Instructions>
        Keep distance at <b>{distanceCm} cm</b>. Lower the slider until the letter is just barely readable. Save that point.
        You can change letter size (recommend 20/40).
      </Instructions>
      {!pxPerMM ? <Warn>Calibrate first for consistent sizing.</Warn> : null}
      <div className="my-6 flex flex-col items-center gap-4">
        <div className="rounded-xl border border-slate-300 bg-white p-8 dark:border-white/10 dark:bg-white/5">
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
            className="rounded-md border border-slate-300 bg-white p-2 dark:border-white/10 dark:bg-[#0b1a33]"
            value={snellenDen}
            onChange={(e) => setSnellenDen(Number(e.target.value))}
          >
            {[40, 32, 25, 20].map((d) => (
              <option key={d} value={d}>20/{d}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500">Result (logCS): <b>{logCS.toFixed(2)}</b></span>
        </div>
        <button className="btn-primary" onClick={save}>Save result</button>
      </div>
    </Card>
  )
}

/* ------------------------------- 4) Amsler ------------------------------- */

function AmslerGrid({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [flags, setFlags] = useState<Set<string>>(new Set())
  const [notes, setNotes] = useState('')
  const n = 21
  const size = 320
  const step = size / (n - 1)

  const toggle = (i: number, j: number) => {
    const k = `${i},${j}`
    setFlags((f) => {
      const n = new Set(f)
      n.has(k) ? n.delete(k) : n.add(k)
      return n
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
    <Card title="Amsler Grid (mark any distorted areas)">
      <Instructions>Wear your near correction. At 30–40 cm, cover one eye and fixate the center dot. Click any squares that look wavy or missing.</Instructions>
      <div className="my-3 flex flex-col items-center gap-3">
        <svg width={size} height={size} className="rounded-md bg-white dark:bg-white/5">
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
          {/* hot areas clickable */}
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
                style={{ cursor: 'pointer' }}
              />
            )),
          )}
        </svg>
        <textarea className="inp max-w-md" rows={3} placeholder="Describe where/what you noticed…" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button className="btn-primary" onClick={save}>Save notes</button>
      </div>
    </Card>
  )
}

/* ---------------------------- 5) Astigmatism ---------------------------- */

function AstigmatismDial({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
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
    <Card title="Astigmatism Dial (clock)">
      <Instructions>Cover one eye. Which spoke direction looks darkest or sharpest? Pick the angle and rate severity.</Instructions>
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
        <button className="btn-primary" onClick={save}>Save</button>
      </div>
    </Card>
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
    <svg width={size} height={size} className="rounded-md bg-white p-2 dark:bg-white/5">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeOpacity={0.2} />
      {lines}
    </svg>
  )
}

/* ----------------------------- 6) Duochrome ------------------------------ */

function Duochrome({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [answer, setAnswer] = useState<'red' | 'green' | 'same' | ''>('')
  const save = () => answer && onResult({ id: 'duochrome', value: answer, label: 'Duochrome' })
  return (
    <Card title="Red‑Green Duochrome">
      <Instructions>After acuity, cover one eye. Which side’s letters look darker/sharper — red, green, or the same?</Instructions>
      <div className="my-4 overflow-hidden rounded-lg border border-slate-200 shadow-sm dark:border-white/10">
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
        {['red', 'green', 'same'].map((x) => (
          <button key={x} className={'btn' + (answer === (x as any) ? ' ring-2 ring-[#6592E1]' : '')} onClick={() => setAnswer(x as any)}>{x}</button>
        ))}
        <button className="btn-primary" disabled={!answer} onClick={save}>Save</button>
      </div>
    </Card>
  )
}

/* ------------------------- 7) Color Arrangement (D15) ------------------------ */

function ColorArrangement({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
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
    <Card title="Color Arrangement (drag to order by hue)">
      <Instructions>Drag the caps to form the smoothest hue gradient. Result is a roughness score for self‑tracking (lower is better).</Instructions>
      <div className="mt-4 grid grid-cols-8 gap-2 sm:grid-cols-12">
        {caps.map((c, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, i)}
            className="aspect-square cursor-move rounded-md border border-slate-300 shadow-sm transition hover:scale-[1.03] dark:border-white/10"
            title={`Hue ${Math.round(c.h)}`}
            style={{ background: `hsl(${c.h} 85% ${c.l}%)` }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span>Score: {score}</span>
        <button className="btn-primary" onClick={save}>Save</button>
      </div>
    </Card>
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

/* ----------------------------- 8) Reading Speed ---------------------------- */

function ReadingSpeed({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
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
    <Card title="Reading Speed & Comfort">
      <Instructions>Tap start, read once at a comfortable pace, then tap stop. Enter errors (skips/misreads) and rate perceived strain.</Instructions>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        {!running ? <button className="btn" onClick={begin}>Start</button> : <button className="btn" onClick={end}>Stop</button>}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 dark:text-slate-300">Errors</label>
          <input className="w-20 inp" type="number" min={0} value={errors} onChange={(e) => setErrors(Number(e.target.value))} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-600 dark:text-slate-300">Strain</label>
          <input type="range" min={0} max={10} value={strain} onChange={(e) => setStrain(Number(e.target.value))} />
          <span className="text-xs">{strain}/10</span>
        </div>
        {wpm ? (
          <>
            <span>Result: <b>{wpm} WPM</b></span>
            <button className="btn-primary" onClick={save}>Save</button>
          </>
        ) : null}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed dark:border-white/10 dark:bg-[#0b1a33]">
        {text}
      </div>
    </Card>
  )
}

const sampleText =
  'Staring at screens for long periods can reduce blink rate, which may lead to temporary dryness and blur. Short, frequent breaks and gentle focusing exercises can help maintain comfort during near work.'

/* ------------------------- 9) NPC & 10) Accommodation ------------------------ */

function NPC({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [t, setT] = useState<(number | '')[]>(['', '', ''])
  const worst = Math.max(...t.filter((x): x is number => typeof x === 'number' && !Number.isNaN(x)))
  const save = () => Number.isFinite(worst) && onResult({ id: 'npc', value: `${worst}`, unit: 'cm (worst of 3)', label: 'NPC' })
  return (
    <Card title="Near Point of Convergence (NPC)">
      <Instructions>Move a small target slowly toward your nose until it doubles or blurs. Measure nose‑to‑target (cm). Repeat 3×; record the <em>worst</em> (largest) value.</Instructions>
      <div className="grid max-w-md grid-cols-3 gap-2 text-sm">
        {t.map((v, i) => (
          <input key={i} className="inp" type="number" min={1} step={0.5} placeholder={`Trial ${i + 1} (cm)`} value={v} onChange={(e) => setT(swapAt(t, i, numOrEmpty(e.target.value)))} />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <span>Worst of 3: {Number.isFinite(worst) ? `${worst} cm` : '—'}</span>
        <button className="btn-primary" onClick={save} disabled={!Number.isFinite(worst as number)}>Save</button>
      </div>
    </Card>
  )
}

function Accommodation({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [nearCm, setNearCm] = useState<number | ''>('')
  const diopters = typeof nearCm === 'number' && nearCm > 0 ? Math.round((100 / nearCm) * 10) / 10 : null
  const save = () => diopters && onResult({ id: 'accommodation', value: String(diopters), unit: 'D', notes: `closest clear ${nearCm} cm`, label: 'Accommodation Amplitude' })
  return (
    <Card title="Accommodation Amplitude (Push‑Up)">
      <Instructions>Move a small target toward the tested eye until it first blurs. Measure the closest clear distance (cm). Amplitude ≈ 100 / cm.</Instructions>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <input className="inp w-40" type="number" min={2} step={0.5} placeholder="Closest clear (cm)" value={nearCm} onChange={(e) => setNearCm(numOrEmpty(e.target.value))} />
        <span>Amplitude: {diopters ? <b>{diopters} D</b> : '—'}</span>
        <button className="btn-primary" onClick={save} disabled={!diopters}>Save</button>
      </div>
    </Card>
  )
}

/* ------------------------------- 11) Glare -------------------------------- */

function GlareSensitivity({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [a, setA] = useState(60) // baseline (no glare) readability
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
    <Card title="Glare/Photophobia (compare thresholds)">
      <Instructions>Adjust each slider to the lowest intensity where the letter is still readable.</Instructions>
      <div className="my-4 grid gap-6 sm:grid-cols-2">
        <GlarePlate label="No glare" value={a} onChange={setA} glare={0} />
        <GlarePlate label="With glare" value={b} onChange={setB} glare={1} />
      </div>
      <div className="text-sm">Impact Δ: <b>{(a - b).toFixed(0)}</b></div>
      <button className="mt-2 btn-primary" onClick={save}>Save</button>
    </Card>
  )
}

function GlarePlate({ label, value, onChange, glare }: { label: string; value: number; onChange: (v: number) => void; glare: 0 | 1 }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-xs text-slate-600 dark:text-slate-300">{label}</div>
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
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

/* --------------------------- 12) Eye Dominance ---------------------------- */

function EyeDominance({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [ans, setAns] = useState<'OD' | 'OS' | ''>('')
  const save = () => ans && onResult({ id: 'eye-dominance', value: ans, label: 'Eye Dominance' })
  return (
    <Card title="Eye Dominance (Miles/Cardhole style)">
      <Instructions>
        Extend arms, make a small triangular aperture with your hands, and center the on‑screen ✦ star.
        Close one eye at a time — which eye keeps the star centered? That’s your dominant eye.
      </Instructions>
      <div className="my-5 flex items-center justify-center">
        <div className="grid h-40 w-40 place-items-center rounded-full border border-dashed">
          <span className="text-4xl">✦</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <button className={'btn' + (ans === 'OD' ? ' ring-2 ring-[#6592E1]' : '')} onClick={() => setAns('OD')}>Right (OD)</button>
        <button className={'btn' + (ans === 'OS' ? ' ring-2 ring-[#6592E1]' : '')} onClick={() => setAns('OS')}>Left (OS)</button>
        <button className="btn-primary" disabled={!ans} onClick={save}>Save</button>
      </div>
    </Card>
  )
}

/* --------------------------- 13) Worth 4‑Dot ------------------------------ */

function Worth4Dot({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [seen, setSeen] = useState<'2 red' | '3 green' | '4 mixed' | '5 double' | ''>('')
  const save = () => seen && onResult({ id: 'worth-4-dot', value: seen, label: 'Worth 4‑Dot' })
  return (
    <Card title="Worth 4‑Dot (needs red‑green glasses)">
      <Instructions>With red‑green glasses on, report how many dots and which colors you see.</Instructions>
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
          <button key={o} className={'btn' + (seen === o ? ' ring-2 ring-[#6592E1]' : '')} onClick={() => setSeen(o)}>{o}</button>
        ))}
        <button className="btn-primary" disabled={!seen} onClick={save}>Save</button>
      </div>
    </Card>
  )
}
function Dot({ color }: { color: string }) {
  return <div className="h-10 w-10 rounded-full border" style={{ background: color }} />
}

/* ------------------------------ 14) Stereopsis ----------------------------- */

function Stereopsis({
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
  const arcsecLevels = [600, 300, 200, 150, 100, 60] // simple ladder
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
    <Card title="Stereopsis (red‑cyan glasses)">
      <Instructions>
        Wear red‑cyan glasses (red left). Identify which circle appears “in front”. Levels decrease disparity (arcsec).
      </Instructions>
      {!pxPerMM ? <Warn>Calibrate first for disparity accuracy.</Warn> : null}
      <div className="my-4 grid place-items-center gap-3">
        <StereoTriplet pxOffset={disparityPx(arcsecLevels[levelIdx])} onPick={answer} />
        <div className="text-xs text-slate-500">Level: ~{arcsecLevels[levelIdx]}" ({disparityPx(arcsecLevels[levelIdx])} px)</div>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={() => answer(true)}>I picked correctly</button>
          <button className="btn" onClick={() => answer(false)}>I picked wrong / unsure</button>
          {hitThreshold ? <button className="btn-primary" onClick={save}>Save</button> : null}
        </div>
      </div>
    </Card>
  )
}

function StereoTriplet({ pxOffset, onPick }: { pxOffset: number; onPick: (correct: boolean) => void }) {
  // one of 3 circles has red/cyan shifted layers to create depth
  const target = Math.floor(Math.random() * 3)
  const radius = 24
  const gap = 40
  return (
    <div className="flex items-center justify-center gap-10">
      {[0, 1, 2].map((i) => (
        <div key={i} className="cursor-pointer rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => onPick(i === target)}>
          <svg width={radius * 2 + gap} height={radius * 2}>
            {/* cyan layer */}
            <circle cx={radius + (i === target ? -pxOffset : 0)} cy={radius} r={radius} fill="rgba(0,255,255,0.7)" />
            {/* red layer */}
            <circle cx={radius + (i === target ? pxOffset : 0)} cy={radius} r={radius} fill="rgba(255,0,0,0.7)" />
            {/* outline */}
            <circle cx={radius} cy={radius} r={radius} fill="none" stroke="currentColor" strokeOpacity={0.2} />
          </svg>
        </div>
      ))}
    </div>
  )
}

/* --------------------------- 15) Visual Field (screen) --------------------------- */

function VisualField({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [running, setRunning] = useState(false)
  const [trial, setTrial] = useState(0)
  const [hits, setHits] = useState<number>(0)
  const [seen, setSeen] = useState<boolean | null>(null)
  const total = 24
  const positions = useMemo(() => {
    // simple ring positions (not clinical)
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
    // add some central
    pts.push({ x: 40, y: 0 }, { x: -40, y: 0 }, { x: 0, y: 40 }, { x: 0, y: -40 })
    return pts.slice(0, total)
  }, [])

  const [current, setCurrent] = useState(0)
  useEffect(() => {
    let to: number | undefined
    if (running) {
      to = window.setTimeout(() => {
        setSeen(false) // missed
        next()
      }, 900) // brief window
    }
    return () => clearTimeout(to)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, trial])

  const next = () => {
    setTrial((t) => t + 1)
    setCurrent((c) => (c + 1) % total)
  }

  const press = () => {
    if (!running) return
    setHits((h) => h + 1)
    setSeen(true)
    next()
  }

  const start = () => {
    setRunning(true)
    setTrial(0)
    setHits(0)
    setSeen(null)
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
    <Card title="Visual Field Screener (keep eyes on +)">
      <Instructions>Fixate the center +. Press <b>Space</b> or click the big button whenever you notice a flash in the periphery.</Instructions>
      <div className="my-4 grid place-items-center gap-3">
        <div className="relative h-64 w-64 rounded-md border border-slate-200 dark:border-white/10">
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
            <button className="btn" onClick={start}>Start</button>
          ) : (
            <button className="btn" onClick={stop}>Stop</button>
          )}
          <button className="btn-primary" onClick={press} disabled={!running}>Saw it</button>
          <span className="text-xs text-slate-500">Hits: {hits} / {trial}</span>
          {!running && trial > 0 ? <button className="btn-primary" onClick={save}>Save</button> : null}
        </div>
      </div>
      <KeyCapture active={running} onSpace={press} />
    </Card>
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

/* -------------------------- Questionnaires (OSDI/CISS/CVS/Night) -------------------------- */

function OSDI({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  // 12 items, 0–4; OSDI = (sum * 25) / (# answered)
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
  const sum = Object.values(scores).reduce((a, b) => (typeof b === 'number' ? a + b : a), 0)
  const osdi = answered ? (sum * 25) / answered : 0
  const save = () => onResult({ id: 'osdi', value: osdi.toFixed(1), unit: '0–100', notes: `${answered}/12 answered`, label: 'OSDI' })
  return (
    <Card title="OSDI (Ocular Surface Disease Index)">
      <Instructions>Rate frequency over the last week (0=none, 4=all the time).</Instructions>
      <table className="mt-2 w-full text-sm">
        <tbody>
          {items.map((q, i) => (
            <tr key={i} className="border-t border-slate-100 dark:border-white/10">
              <td className="py-2 pr-2">{q}</td>
              <td className="w-48">
                <select className="inp" value={scores[i] ?? ''} onChange={(e) => setScores((s) => ({ ...s, [i]: e.target.value === '' ? '' : Number(e.target.value) }))}>
                  <option value="">—</option>
                  {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 text-sm">Score: <b>{osdi.toFixed(1)}</b> / 100</div>
      <button className="mt-2 btn-primary" onClick={save} disabled={!answered}>Save</button>
    </Card>
  )
}

function CISS({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
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
    <Card title="CISS (Convergence Insufficiency Symptom Survey)">
      <Instructions>Rate frequency (0=never, 1=rarely, 2=sometimes, 3=frequently, 4=always).</Instructions>
      <div className="mt-2 grid gap-2">
        {questions.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-slate-100 pt-2 text-sm dark:border-white/10">
            <span>{q}</span>
            <select className="inp" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 btn-primary" onClick={save}>Save</button>
    </Card>
  )
}

function CVS({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const [habit, setHabit] = useState(0)
  const items = ['Dryness', 'Burning', 'Headache', 'Blur after screen', 'Double vision', 'Neck/shoulder pain', 'Light sensitivity']
  const [scores, setScores] = useState<number[]>(Array(items.length).fill(0))
  const total = scores.reduce((a, b) => a + b, 0)
  const save = () => onResult({ id: 'cvs', value: String(total), unit: 'symptom score', notes: `20‑20‑20 adherence ${habit}/7 days`, label: 'CVS / 20‑20‑20' })
  return (
    <Card title="Computer Vision Syndrome / 20‑20‑20">
      <Instructions>Rate last‑week symptom frequency (0–4). Log how many days you did the 20‑20‑20 rule.</Instructions>
      <div className="grid gap-2">
        {items.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-slate-100 pt-2 text-sm dark:border-white/10">
            <span>{q}</span>
            <select className="inp" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
        <div className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-slate-100 pt-2 text-sm dark:border-white/10">
          <span>20‑20‑20 days (out of 7)</span>
          <input className="inp" type="number" min={0} max={7} value={habit} onChange={(e) => setHabit(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 btn-primary" onClick={save}>Save</button>
    </Card>
  )
}

function NightVision({ onResult }: { onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void }) {
  const items = ['Halos around lights', 'Glare from headlights', 'Difficulty reading street signs', 'Washed out contrast', 'Need more light than others', 'Slower dark adaptation']
  const [scores, setScores] = useState<number[]>(Array(items.length).fill(0))
  const total = scores.reduce((a, b) => a + b, 0)
  const save = () => onResult({ id: 'night-vision', value: String(total), unit: 'checklist score', label: 'Night/Low‑Light' })
  return (
    <Card title="Night‑Vision / Low‑Light Checklist">
      <Instructions>Rate how often you notice each (0–4). Track the trend over time.</Instructions>
      <div className="grid gap-2">
        {items.map((q, i) => (
          <div key={i} className="grid grid-cols-[1fr,9rem] items-center gap-2 border-t border-slate-100 pt-2 text-sm dark:border-white/10">
            <span>{q}</span>
            <select className="inp" value={scores[i]} onChange={(e) => setScores((s) => swapAt(s, i, Number(e.target.value)))}>
              {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm">Score: <b>{total}</b></div>
      <button className="mt-2 btn-primary" onClick={save}>Save</button>
    </Card>
  )
}

/* ------------------------------- 16) PD Ruler ------------------------------- */

function PDRuler({
  pxPerMM,
  onResult,
}: {
  pxPerMM: number | null
  onResult: (r: Omit<TestResult, 'timestamp' | 'eye' | 'category' | 'distanceCm'>) => void
}) {
  const [pd, setPd] = useState<number | ''>('')
  const save = () => typeof pd === 'number' && onResult({ id: 'pd-ruler', value: String(pd), unit: 'mm', label: 'PD' })
  return (
    <Card title="PD Ruler (manual)">
      <Instructions>Stand at a mirror. Hold a real millimeter ruler under your eyes and measure center‑to‑center pupil distance. Or place a clear card against the screen ruler (calibrated).</Instructions>
      {!pxPerMM ? <Warn>Calibrate to show accurate on‑screen mm scale.</Warn> : null}
      <div className="my-3">
        <div className="mb-2 text-xs text-slate-600 dark:text-slate-300">On‑screen mm scale</div>
        <div className="relative h-12 rounded-md border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
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
        <input className="inp w-40" type="number" min={45} max={80} placeholder="Enter PD (mm)" value={pd} onChange={(e) => setPd(numOrEmpty(e.target.value))} />
        <button className="btn-primary" onClick={save} disabled={!(typeof pd === 'number')}>Save</button>
      </div>
    </Card>
  )
}

/* ------------------------------- Results Panel ------------------------------ */

function ResultsPanel({ results, onClear }: { results: TestResult[]; onClear: () => void }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [eye, setEye] = useState<Eye | 'all'>('all')

  const filtered = results.filter(
    (r) =>
      (cat === 'all' || r.category === cat) &&
      (eye === 'all' || r.eye === eye) &&
      (q === '' || r.label.toLowerCase().includes(q.toLowerCase())),
  )

  const exportCSV = () => {
    const header = ['date', 'label', 'category', 'eye', 'value', 'unit', 'notes', 'distanceCm']
    const rows = filtered.map((r) => [
      new Date(r.timestamp).toISOString(),
      r.label,
      r.category,
      r.eye,
      r.value,
      r.unit ?? '',
      r.notes ?? '',
      r.distanceCm ?? '',
    ])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'visionary_results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0b1a33]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-900 dark:text-white">Saved results</div>
        <div className="flex items-center gap-2 text-xs">
          <input className="rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#0b1a33]" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#0b1a33]" value={cat} onChange={(e) => setCat(e.target.value as any)}>
            <option value="all">All</option>
            <option value="score">Score‑based</option>
            <option value="self">Self/Notes</option>
            <option value="accessory">Accessories</option>
          </select>
          <select className="rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/10 dark:bg-[#0b1a33]" value={eye} onChange={(e) => setEye(e.target.value as any)}>
            <option value="all">All eyes</option>
            <option value="OD">OD</option>
            <option value="OS">OS</option>
            <option value="OU">OU</option>
          </select>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
          {results.length ? <button className="btn" onClick={onClear}>Clear all</button> : null}
        </div>
      </div>
      {!filtered.length ? (
        <div className="text-xs text-slate-500">No results yet.</div>
      ) : (
        <div className="grid gap-2 text-sm">
          {filtered.map((r, i) => (
            <div key={i} className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center dark:border-white/10 dark:bg-white/5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{r.label}</span>
                <Tag>{r.category}</Tag>
                <span>{r.value}{r.unit ? ` ${r.unit}` : ''}</span>
                {r.notes ? <span className="text-xs text-slate-500">{r.notes}</span> : null}
                <span className="rounded border border-slate-200 px-2 text-[10px] uppercase dark:border-white/10">{r.eye}</span>
              </div>
              <div className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* --------------------------------- Shared UI -------------------------------- */

function Warn({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">{children}</div>
}

function swapAt<T>(arr: T[], i: number, v: T) {
  const x = [...arr]
  x[i] = v
  return x
}
function numOrEmpty(v: string): number | '' {
  const n = Number(v)
  return Number.isFinite(n) ? n : ''
}
