'use client'

import { useState } from 'react'
import { useCheckins } from '@/lib/hooks/useCheckins'

const moods = [
  { value: 1, emoji: '😣', label: 'Strained' },
  { value: 2, emoji: '😴', label: 'Tired' },
  { value: 3, emoji: '🙂', label: 'Okay' },
  { value: 4, emoji: '😃', label: 'Good' },
  { value: 5, emoji: '🌟', label: 'Great' },
]

export default function DailyCheckIn() {
  const { addCheckin, checkedToday } = useCheckins()
  const [selected, setSelected] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  if (checkedToday || done) {
    return (
      <div className="rounded-2xl border border-v-ceil/20 bg-v-white p-5 shadow-soft dark:bg-v-dark dark:text-v-white">
        <p className="font-manrope text-base text-v-dark dark:text-v-white">Thanks! Your check-in was saved for today.</p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-v-ceil/10 p-5 sm:p-6 dark:bg-v-dark/20">
      <h3 className="font-manrope text-lg font-semibold text-v-dark dark:text-v-white">How are your eyes feeling today?</h3>
      <p className="mt-1 text-sm text-v-dark/70 dark:text-v-white/70">A quick daily check helps track trends over time.</p>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {moods.map(m => (
          <button
            key={m.value}
            onClick={() => setSelected(m.value)}
            className={`rounded-2xl border flex flex-col items-center justify-center p-3 transition-all duration-300 ${
              selected === m.value
                ? 'border-v-ceil bg-v-white shadow-soft transform scale-105 dark:bg-v-dark'
                : 'border-v-dark/10 bg-v-white hover:bg-v-dark/5 dark:bg-v-dark dark:border-v-white/10 dark:hover:bg-v-white/10'
            }`}
            style={{ minHeight: '60px' }}
          >
            <span className="text-2xl">{m.emoji}</span>
            <span className="text-xs mt-1">{m.label}</span>
          </button>
        ))}
      </div>

      <button
        disabled={!selected}
        onClick={() => { if (selected) { addCheckin(selected); setDone(true) } }}
        className="mt-4 rounded-xl bg-v-ceil px-5 py-3 font-manrope font-semibold text-white shadow-soft transition-all duration-300 hover:opacity-90 disabled:opacity-40 w-full"
      >
        Save today’s check-in
      </button>
    </div>
  )
}
