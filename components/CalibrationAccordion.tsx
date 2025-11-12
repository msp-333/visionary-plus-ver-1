import React, { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  pxPerMM: number | null
  setPxPerMM: (v: number) => void
  onDone?: () => void
}

export function CalibrationAccordion({ pxPerMM, setPxPerMM, onDone }: Props) {
  const [open, setOpen] = useState<'card' | 'inch' | 'coin'>('card')
  const [estimate, setEstimate] = useState<number | null>(null)

  useEffect(() => {
    // Estimate px/mm via CSS inch (non-authoritative)
    const probe = document.createElement('div')
    probe.style.width = '1in'
    probe.style.position = 'absolute'
    probe.style.visibility = 'hidden'
    document.body.appendChild(probe)
    const pxPerIn = probe.offsetWidth || 96
    document.body.removeChild(probe)
    const mm = pxPerIn / 25.4
    if (Number.isFinite(mm)) setEstimate(mm)
  }, [])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <div className="text-sm font-medium">Screen calibration</div>
          <p className="text-xs text-slate-300">
            Choose a method. Aim for a precise match — size‑based tests depend on it.
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Scale: <b>{pxPerMM ? pxPerMM.toFixed(2) : '—'}</b> px/mm{' '}
          {pxPerMM ? <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-200">saved</span> : null}
          {!pxPerMM && estimate ? (
            <button
              className="ml-2 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-200 underline"
              onClick={() => setPxPerMM(estimate)}
            >
              Use estimate
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <AccordionItem
          id="card"
          title="A) Credit/ID card (85.6 mm)"
          open={open === 'card'}
          onToggle={() => setOpen('card')}
        >
          <CardCalibrator onSave={(px) => setPxPerMM(px / 85.6)} />
        </AccordionItem>

        <AccordionItem
          id="inch"
          title="B) 1‑inch box (pinch/zoom)"
          open={open === 'inch'}
          onToggle={() => setOpen('inch')}
        >
          <InchBoxCalibrator onSave={(px) => setPxPerMM(px / 25.4)} />
        </AccordionItem>

        <AccordionItem
          id="coin"
          title="C) Coin (choose + match diameter)"
          open={open === 'coin'}
          onToggle={() => setOpen('coin')}
        >
          <CoinCalibrator onSave={(px, mm) => setPxPerMM(px / mm)} />
        </AccordionItem>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          className="rounded-xl bg-[#6592E1] px-4 py-2 text-sm text-white disabled:opacity-60"
          onClick={onDone}
          disabled={!pxPerMM}
          style={{ minHeight: 44, minWidth: 44 }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function AccordionItem({
  id,
  title,
  open,
  onToggle,
  children,
}: {
  id: string
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <button
        className="flex w-full items-center justify-between px-3 py-3 text-left"
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        onClick={onToggle}
      >
        <span className="text-sm font-medium">{title}</span>
        <span className="text-xs text-slate-400">{open ? 'Hide' : 'Show'}</span>
      </button>
      <div id={`panel-${id}`} hidden={!open} className="border-t border-white/10 p-3">
        {children}
      </div>
    </div>
  )
}

function CardCalibrator({ onSave }: { onSave: (barPx: number) => void }) {
  const [barPx, setBarPx] = useState(300)
  return (
    <div>
      <div
        className="mx-auto h-8 rounded-md border border-white/10 bg-white/10"
        style={{ width: barPx }}
        aria-label="Adjust to match your card width"
      />
      <input
        className="mt-2 w-full"
        type="range"
        min={100} max={700} step={1}
        value={barPx}
        onChange={(e) => setBarPx(Number(e.target.value))}
      />
      <div className="mt-2 flex items-center justify-between text-xs">
        <span>Match this bar to your card width (85.6 mm)</span>
        <button
          className="rounded-full bg-[#6592E1] px-3 py-1 text-white"
          onClick={() => onSave(barPx)}
        >
          Save
        </button>
      </div>
    </div>
  )
}

function InchBoxCalibrator({ onSave }: { onSave: (px: number) => void }) {
  const boxRef = useRef<HTMLDivElement | null>(null)
  const [scale, setScale] = useState(1)

  // simple pinch/zoom support
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    let startDist = 0
    let startScale = 1
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        startDist = dist(e.touches[0], e.touches[1])
        startScale = scale
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const d = dist(e.touches[0], e.touches[1])
        const s = Math.min(3, Math.max(0.3, startScale * (d / startDist)))
        setScale(s)
      }
    }
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onTouchStart as any)
      el.removeEventListener('touchmove', onTouchMove as any)
    }
  }, [scale])

  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          ref={boxRef}
          className="shrink-0 border border-dashed border-white/30"
          style={{ width: `${scale * 96}px`, height: `${scale * 96}px` }} // 1in ≈ 96px in CSS
          aria-label="Pinch/zoom box to 1‑inch"
        />
        <div className="text-xs text-slate-300">
          Place a 1‑inch ruler/object over the box. Pinch/zoom (or use slider) to match exactly.
        </div>
      </div>
      <input
        className="mt-2 w-full"
        type="range"
        min={0.3} max={3} step={0.01}
        value={scale}
        onChange={(e) => setScale(Number(e.target.value))}
      />
      <div className="mt-2 flex items-center justify-end">
        <button
          className="rounded-full bg-[#6592E1] px-3 py-1 text-white"
          onClick={() => onSave(scale * 96)}
        >
          Save scale
        </button>
      </div>
    </div>
  )
}

function CoinCalibrator({ onSave }: { onSave: (px: number, mm: number) => void }) {
  const coins = [
    { label: 'US quarter (24.26 mm)', mm: 24.26 },
    { label: '€1 coin (23.25 mm)', mm: 23.25 },
    { label: '₹10 coin (27.0 mm)', mm: 27.0 },
  ]
  const [mm, setMm] = useState(24.26)
  const [barPx, setBarPx] = useState(100)
  return (
    <div>
      <select
        className="w-full rounded-md border border-white/10 bg-white/5 p-2 text-sm"
        value={mm}
        onChange={(e) => setMm(Number(e.target.value))}
      >
        {coins.map((c) => (
          <option key={c.label} value={c.mm}>{c.label}</option>
        ))}
      </select>
      <div className="mt-2">
        <div
          className="mx-auto h-8 rounded-md border border-white/10 bg-white/10"
          style={{ width: barPx }}
        />
        <input
          className="mt-2 w-full"
          type="range" min={60} max={180} step={1}
          value={barPx}
          onChange={(e) => setBarPx(Number(e.target.value))}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span>Match bar to coin diameter</span>
        <button
          className="rounded-full bg-[#6592E1] px-3 py-1 text-white"
          onClick={() => onSave(barPx, mm)}
        >
          Save
        </button>
      </div>
    </div>
  )
}

function dist(a: Touch, b: Touch) {
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}
