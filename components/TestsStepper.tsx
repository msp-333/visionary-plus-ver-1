import React from 'react'
import { TOKENS } from '../app/(app)/tests/types'

export function TestsStepper({
  steps,
  current,
  className,
}: {
  steps: string[]
  current: number
  className?: string
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100)
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-[11px] text-slate-300">
        {steps.map((s, i) => (
          <div key={s} className="flex-1">
            <div
              className={
                'mb-1 font-medium ' +
                (i === current ? 'text-slate-100' : 'text-slate-400')
              }
            >
              {s}
            </div>
          </div>
        ))}
      </div>
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-white/10"
        aria-label="Progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="absolute left-0 top-0 h-full bg-[#6592E1] transition-[width]"
          style={{ width: `${pct}%`, transitionDuration: TOKENS.motion.fast }}
        />
      </div>
    </div>
  )
}
