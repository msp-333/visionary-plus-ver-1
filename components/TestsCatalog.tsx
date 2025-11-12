import React from 'react'
import { Category, TestId, TestMeta } from '../app/(app)/tests/types'

export function TestsCatalog({
  tests,
  activeId,
  onPick,
  search,
  onSearch,
  category,
  onCategoryChange,
}: {
  tests: TestMeta[]
  activeId: TestId
  onPick: (id: TestId) => void
  search: string
  onSearch: (q: string) => void
  category: Category | 'all'
  onCategoryChange: (v: Category | 'all') => void
}) {
  const opts: (Category | 'all')[] = ['all', 'score', 'self', 'accessory']
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {opts.map((o) => (
            <button
              key={o}
              onClick={() => onCategoryChange(o)}
              className={
                'rounded-full px-3 py-1 text-xs transition ' +
                (category === o ? 'bg-[#6592E1] text-white' : 'bg-white/10 text-slate-200')
              }
              style={{ minHeight: 32, minWidth: 44 }}
            >
              {o === 'all' ? 'All' : o === 'score' ? 'Score‑based' : o === 'self' ? 'Self/Notes' : 'Accessories'}
            </button>
          ))}
        </div>
        <label className="sr-only" htmlFor="searchTests">Search tests</label>
        <input
          id="searchTests"
          placeholder="Search tests…"
          className="w-44 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {tests.map((t) => (
          <li key={t.id}>
            <button
              className={
                'w-full rounded-2xl border p-4 text-left transition ' +
                (activeId === t.id
                  ? 'border-transparent bg-[#6592E1] text-white'
                  : 'border-white/10 bg-white/5 hover:bg-white/10')
              }
              onClick={() => onPick(t.id)}
              aria-pressed={activeId === t.id}
              style={{ minHeight: 84 }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold">{t.label}</div>
                  {t.short ? <div className="mt-1 text-xs text-slate-300">{t.short}</div> : null}
                </div>
                <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] uppercase">
                  {t.category === 'score' ? 'Score' : t.category === 'self' ? 'Self' : 'Accessories'}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
