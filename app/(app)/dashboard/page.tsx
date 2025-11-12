'use client'

import DailyCheckIn from '@/components/DailyCheckIn'
import StreakCard from '@/components/StreakCard'
import QueryProvider from '@/components/QueryProvider'
import UserDropdown from '@/components/UserDropdown'

type Metrics = {
  streak: number
  exercisesTaken: number
  achievements: number
  totalMinutes: number
}

function DashboardMetrics() {
  // This component will use React Query
  // For now, let's just return a placeholder
  return (
    <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
      <div className="rounded-2xl bg-white p-4 shadow-soft border border-v-dark/10 flex flex-col items-center dark:bg-v-dark dark:border-v-white/10">
        <div className="text-v-ceil text-xl">🔥</div>
        <p className="mt-1 text-xs text-v-dark/60 text-center dark:text-v-white/60">Streak</p>
        <p className="mt-1 text-xl font-bold dark:text-v-white">0d</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-soft border border-v-dark/10 flex flex-col items-center dark:bg-v-dark dark:border-v-white/10">
        <div className="text-v-ceil text-xl">🏋️</div>
        <p className="mt-1 text-xs text-v-dark/60 text-center dark:text-v-white/60">Exercises</p>
        <p className="mt-1 text-xl font-bold dark:text-v-white">0</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-soft border border-v-dark/10 flex flex-col items-center dark:bg-v-dark dark:border-v-white/10">
        <div className="text-v-ceil text-xl">🏆</div>
        <p className="mt-1 text-xs text-v-dark/60 text-center dark:text-v-white/60">Achievements</p>
        <p className="mt-1 text-xl font-bold dark:text-v-white">0</p>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-soft border border-v-dark/10 flex flex-col items-center dark:bg-v-dark dark:border-v-white/10">
        <div className="text-v-ceil text-xl">⏱️</div>
        <p className="mt-1 text-xs text-v-dark/60 text-center dark:text-v-white/60">Total Time</p>
        <p className="mt-1 text-xl font-bold dark:text-v-white">0m</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <section className="py-6 sm:py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-manrope text-2xl font-extrabold dark:text-v-white">Welcome back 👋</h1>
          <p className="mt-1 text-v-dark/70 text-sm dark:text-v-white/70">Keep your eyes healthy with quick sessions.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/exercises" className="rounded-xl bg-v-ceil px-4 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90">Start Exercise</a>
          <UserDropdown />
        </div>
      </div>

      <div className="mt-6 space-y-6">
        <QueryProvider>
          <DashboardMetrics />
        </QueryProvider>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <DailyCheckIn />
          </div>
          <StreakCard />
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-v-ceil to-v-pastel p-5 shadow-soft">
          <h2 className="font-manrope text-xl font-semibold text-white">Quick Start</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a href="/exercises" className="rounded-2xl bg-white p-4 hover:opacity-90 flex items-center gap-3 dark:bg-v-dark">
              <div className="bg-v-ceil text-white rounded-full w-10 h-10 flex items-center justify-center">🏋️</div>
              <span className="font-manrope font-semibold dark:text-v-white">Start an Exercise</span>
            </a>
            <a href="/tests" className="rounded-2xl bg-white p-4 hover:opacity-90 flex items-center gap-3 dark:bg-v-dark">
              <div className="bg-v-ceil text-white rounded-full w-10 h-10 flex items-center justify-center">📋</div>
              <span className="font-manrope font-semibold dark:text-v-white">Take a Test</span>
            </a>
            <a href="/blog" className="rounded-2xl bg-white p-4 hover:opacity-90 flex items-center gap-3 dark:bg-v-dark">
              <div className="bg-v-ceil text-white rounded-full w-10 h-10 flex items-center justify-center">📰</div>
              <span className="font-manrope font-semibold dark:text-v-white">Read a Blog</span>
            </a>
          </div>
        </div>
        
        <div className="rounded-2xl border border-v-dark/10 bg-white p-5 shadow-soft dark:bg-v-dark dark:border-v-white/10">
          <h2 className="font-manrope text-xl font-semibold dark:text-v-white">Recent Activity</h2>
          <div className="mt-4">
            <p className="text-v-dark/70 dark:text-v-white/70">No recent activity yet. Complete an exercise or take a test to get started!</p>
          </div>
        </div>
      </div>
    </section>
  )
}
