'use client'

import { useCheckins } from '@/lib/hooks/useCheckins'

export default function StreakCard() {
  const { streak, last7 } = useCheckins()
  return (
    <div className="rounded-2xl border border-v-dark/10 bg-v-white p-5 shadow-soft dark:bg-v-dark dark:border-v-white/10">
      <div className="flex items-center gap-2">
        <div className="text-v-ceil text-2xl">🔥</div>
        <p className="text-sm text-v-dark/60 dark:text-v-white/60">Current Streak</p>
      </div>
      <p className="mt-1 text-4xl font-extrabold text-v-dark dark:text-v-white">{streak}d</p>
      <div className="mt-4">
        <svg viewBox="0 0 140 40" className="w-full">
          {last7.map((d, i) => {
            const h = d.mood ? (d.mood / 5) * 36 + 2 : 2
            return (
              <rect key={d.date} x={i*20+2} y={38-h} width="16" height={h} rx="3" fill={d.mood ? "#6592E1" : "#E6EEF9"} />
            )
          })}
        </svg>
        <p className="mt-2 text-xs text-v-dark/60 dark:text-v-white/60">Last 7 days mood (higher = better)</p>
      </div>
    </div>
  )
}
