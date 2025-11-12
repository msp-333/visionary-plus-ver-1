import React from 'react'
import { Eye } from '../app/(app)/tests/types'

export function EyeDistancePanel({
  eye,
  setEye,
  distanceCm,
  setDistanceCm,
}: {
  eye: Eye
  setEye: (e: Eye) => void
  distanceCm: number
  setDistanceCm: (n: number) => void
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm font-medium">Eye under test</div>
          <div className="mt-2 grid grid-cols-3 gap-2" role="tablist" aria-label="Eye selection">
            {(['OD', 'OS', 'OU'] as Eye[]).map((e) => (
              <button
                key={e}
                role="tab"
                aria-selected={eye === e}
                onClick={() => setEye(e)}
                className={
                  'min-h-11 rounded-xl border px-3 py-2 text-sm transition ' +
                  (eye === e
                    ? 'border-transparent bg-[#6592E1] text-white'
                    : 'border-white/10 bg-white/5 text-slate-100')
                }
                style={{ minWidth: 44, minHeight: 44 }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium">Testing distance</div>
          <div className="mt-2">
            <input
              aria-label="Distance (cm)"
              type="range"
              min={30}
              max={500}
              step={1}
              value={distanceCm}
              onChange={(e) => setDistanceCm(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="text-slate-300">
                <strong>{distanceCm}</strong> cm
              </div>
              <div className="flex gap-2">
                {[40, 200, 300].map((n) => (
                  <button
                    key={n}
                    className={'rounded-full px-3 py-1 text-xs ' + (distanceCm === n ? 'bg-[#6592E1] text-white' : 'bg-white/10')}
                    onClick={() => setDistanceCm(n)}
                    style={{ minWidth: 44, minHeight: 32 }}
                    aria-label={`Preset ${n} centimeters`}
                  >
                    {n} cm
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <label htmlFor="distanceNum" className="text-xs text-slate-300">
                or type
              </label>
              <input
                id="distanceNum"
                type="number"
                min={30}
                max={500}
                className="w-24 rounded-md border border-white/10 bg-white/5 p-2 text-sm"
                value={distanceCm}
                onChange={(e) => setDistanceCm(Number(e.target.value))}
              />
              <span className="text-xs text-slate-400">cm (near: 40; distance: 200–300)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
