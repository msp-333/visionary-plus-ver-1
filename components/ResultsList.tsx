'use client'

import React, { useId, useMemo, useState } from 'react'
import { Category, Eye, TestResult } from '../app/(app)/tests/types' 

type CatFilter = Category | 'all'
type EyeFilter = Eye | 'all'
type SortKey = 'newest' | 'oldest' | 'label-asc' | 'label-desc'

export function ResultsList({
  results,
  onClear,
}: {
  results: TestResult[]
  onClear: () => void
}) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<CatFilter>('all')
  const [eye, setEye] = useState<EyeFilter>('all')
  const [sort, setSort] = useState<SortKey>('newest')

  const searchId = useId()
  const catId = useId()
  const eyeId = useId()
  const sortId = useId()

  const filtered = useMemo(() => {
    const base = results.filter(
      (r) =>
        (cat === 'all' || r.category === cat) &&
        (eye === 'all' || r.eye === eye) &&
        (q === '' || r.label.toLowerCase().includes(q.toLowerCase())),
    )

    const sorted = [...base].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.timestamp - a.timestamp
        case 'oldest':
          return a.timestamp - b.timestamp
        case 'label-asc':
          return a.label.localeCompare(b.label)
        case 'label-desc':
          return b.label.localeCompare(a.label)
        default:
          return 0
      }
    })

    return sorted
  }, [results, q, cat, eye, sort])

  const exportCSV = () => {
    if (!filtered.length) return
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
    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    a.download = `visionary_results_${stamp}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const copySummary = async (r: TestResult) => {
    const summary = `${r.label} — ${r.value}${r.unit ? ` ${r.unit}` : ''} • Eye: ${r.eye} • ${new Date(
      r.timestamp,
    ).toLocaleString()}${r.distanceCm ? ` • ${r.distanceCm} cm` : ''}${r.notes ? ` • ${r.notes}` : ''}`
    try {
      await navigator.clipboard.writeText(summary)
      // subtle inline confirmation without alert()
      const el = document.createElement('div')
      el.textContent = 'Copied!'
      el.className =
        'fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-3 py-1 text-xs text-white z-50'
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 900)
    } catch {
      // Fallback: show a prompt for manual copy
      window.prompt('Copy summary:', summary)
    }
  }

  const printOrSavePdf = () => {
    window.print() // users can choose "Save as PDF"
  }

  const clearFilters = () => {
    setQ('')
    setCat('all')
    setEye('all')
    setSort('newest')
  }

  return (
    <div className="rounded-2xl border border-v-dark/10 bg-white/50 p-4 shadow-soft backdrop-blur-md dark:bg-white/5 dark:border-white/10">
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold text-v-dark dark:text-white">Saved results</div>

        {/* Actions row */}
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          {/* Search */}
          <div className="flex items-center gap-2">
            <label htmlFor={searchId} className="sr-only">
              Search results
            </label>
            <input
              id={searchId}
              className="w-full rounded-md border border-v-dark/10 bg-white px-2 py-1 text-sm text-v-dark placeholder-v-dark/50 focus:outline-none focus:ring-2 focus:ring-v-ceil/60 dark:bg-white/5 dark:text-white dark:border-white/10"
              placeholder="Search by label…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <label htmlFor={catId} className="sr-only">
                Category
              </label>
              <select
                id={catId}
                className="w-full rounded-md border border-v-dark/10 bg-white px-2 py-1 text-sm text-v-dark focus:outline-none focus:ring-2 focus:ring-v-ceil/60 dark:bg-white/5 dark:text-white dark:border-white/10"
                value={cat}
                onChange={(e) => setCat(e.target.value as CatFilter)}
              >
                <option value="all">All categories</option>
                <option value="score">Score-based</option>
                <option value="self">Self/Notes</option>
                <option value="accessory">Accessories</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor={eyeId} className="sr-only">
                Eye
              </label>
              <select
                id={eyeId}
                className="w-full rounded-md border border-v-dark/10 bg-white px-2 py-1 text-sm text-v-dark focus:outline-none focus:ring-2 focus:ring-v-ceil/60 dark:bg-white/5 dark:text-white dark:border-white/10"
                value={eye}
                onChange={(e) => setEye(e.target.value as EyeFilter)}
              >
                <option value="all">All eyes</option>
                <option value="OD">OD</option>
                <option value="OS">OS</option>
                <option value="OU">OU</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor={sortId} className="sr-only">
                Sort
              </label>
              <select
                id={sortId}
                className="w-full rounded-md border border-v-dark/10 bg-white px-2 py-1 text-sm text-v-dark focus:outline-none focus:ring-2 focus:ring-v-ceil/60 dark:bg-white/5 dark:text-white dark:border-white/10"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="label-asc">Label A→Z</option>
                <option value="label-desc">Label Z→A</option>
              </select>
            </div>
          </div>

          {/* Primary actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-md border border-v-dark/10 bg-white px-3 py-1 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow transition dark:bg-white/5 dark:text-white dark:border-white/10"
              onClick={exportCSV}
              disabled={!filtered.length}
              title={!filtered.length ? 'No results to export' : 'Export filtered results to CSV'}
            >
              Export CSV
            </button>

            <button
              className="rounded-md border border-v-dark/10 bg-white px-3 py-1 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow transition dark:bg-white/5 dark:text-white dark:border-white/10"
              onClick={printOrSavePdf}
              title="Open print dialog; choose “Save as PDF” to share"
            >
              Print / Save PDF
            </button>

            {results.length > 0 && (
              <button
                className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 shadow-sm hover:-translate-y-0.5 hover:shadow transition dark:bg-red-500/10 dark:text-red-300 dark:border-red-400/20"
                onClick={onClear}
                title="Remove all saved results"
              >
                Clear all
              </button>
            )}

            <button
              className="rounded-md border border-v-dark/10 bg-white px-3 py-1 text-sm shadow-sm hover:-translate-y-0.5 hover:shadow transition dark:bg-white/5 dark:text-white dark:border-white/10"
              onClick={clearFilters}
              title="Reset all filters"
            >
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!filtered.length ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-v-dark/10 bg-white/40 p-6 text-center text-sm text-v-dark/70 dark:bg-white/5 dark:text-white/70 dark:border-white/10">
          <div className="text-2xl">🗂️</div>
          <p>
            {results.length === 0
              ? 'No results yet. Take a test and they will appear here.'
              : 'No results match your filters.'}
          </p>
          {results.length > 0 && (
            <button
              className="mt-1 rounded-md border border-v-dark/10 bg-white px-3 py-1 text-xs shadow-sm hover:-translate-y-0.5 hover:shadow transition dark:bg-white/5 dark:text-white dark:border-white/10"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2">
          {filtered.map((r, i) => (
            <li
              key={`${r.timestamp}-${r.label}-${i}`}
              className="group rounded-xl border border-v-dark/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow dark:bg-[#0b1a33] dark:border-white/10"
            >
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-v-dark dark:text-white">{r.label}</div>

                  <span className="rounded-full border border-v-dark/15 bg-v-ceil/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-v-dark/80 dark:border-white/10 dark:bg-v-ceil/20 dark:text-white/90">
                    {r.category}
                  </span>

                  <span className="text-sm text-v-dark/90 dark:text-white/90">
                    {r.value}
                    {r.unit ? ` ${r.unit}` : ''}
                  </span>

                  {r.notes ? (
                    <span
                      className="max-w-[28ch] truncate text-xs text-v-dark/60 dark:text-white/60"
                      title={r.notes}
                    >
                      {r.notes}
                    </span>
                  ) : null}

                  <span className="rounded border border-v-dark/10 px-2 text-[10px] uppercase text-v-dark/80 dark:text-white/80 dark:border-white/10">
                    {r.eye}
                  </span>
                </div>

                <div className="text-xs text-v-dark/60 dark:text-white/60">
                  {new Date(r.timestamp).toLocaleString()}
                  {r.distanceCm ? ` · ${r.distanceCm} cm` : ''}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button
                  className="rounded-md border border-v-dark/10 bg-white px-3 py-1 shadow-sm transition hover:-translate-y-0.5 hover:shadow dark:bg-white/5 dark:text-white dark:border-white/10"
                  onClick={() => copySummary(r)}
                  title="Copy a one-line summary to clipboard"
                >
                  Copy summary
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
