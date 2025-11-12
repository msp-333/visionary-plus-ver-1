'use client'

import { useState } from 'react'
import Logo from '@/components/Logo'

const goals = ['Reduce eye strain', 'Improve focus', 'Track vision metrics', 'Build daily habit']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [reminder, setReminder] = useState('Evening')
  const [mood, setMood] = useState<number | null>(null)

  return (
    <div className="grid min-h-dvh place-items-center bg-radial px-4">
      <div
        className="w-full max-w-lg rounded-3xl border border-v-dark/10 bg-white p-8 shadow-soft dark:bg-white text-v-dark dark:text-v-dark"
        style={{ colorScheme: 'light' }}
      >
        <Logo />
        <div className="mt-4 flex items-center justify-between">
          <h1 className="font-manrope text-2xl font-extrabold">Let’s get set up</h1>
          <p className="text-sm text-v-dark/60">Step {step} of 3</p>
        </div>

        {step === 1 && (
          <div className="mt-4">
            <p className="text-sm text-v-dark/70">What are your goals?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {goals.map(g => {
                const active = selectedGoals.includes(g)
                return (
                  <button
                    key={g}
                    onClick={() =>
                      setSelectedGoals(s => (active ? s.filter(x => x !== g) : [...s, g]))
                    }
                    className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-v-ceil text-white shadow-soft'
                        : 'bg-v-dark/5 text-v-dark/70 hover:bg-v-dark/10'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setStep(2)}
              className="mt-6 rounded-xl bg-v-ceil px-5 py-3 font-manrope font-semibold text-white"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-4">
            <p className="text-sm text-v-dark/70">When should we remind you?</p>
            <div className="mt-3 flex gap-2">
              {['Morning', 'Afternoon', 'Evening'].map(r => (
                <button
                  key={r}
                  onClick={() => setReminder(r)}
                  className={`rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
                    reminder === r
                      ? 'bg-v-ceil text-white shadow-soft'
                      : 'bg-v-dark/5 text-v-dark/70 hover:bg-v-dark/10'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(1)} className="rounded-xl bg-v-dark/5 px-4 py-2">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-xl bg-v-ceil px-5 py-3 font-manrope font-semibold text-white"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-4">
            <p className="text-sm text-v-dark/70">How are your eyes feeling today?</p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {['Strained','Tired','Okay','Good','Great'].map((label, i) => {
                const v = i + 1
                const active = mood === v
                return (
                  <button
                    key={label}
                    onClick={() => setMood(v)}
                    className={`rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-v-ceil text-white shadow-soft transform scale-105'
                        : 'bg-v-dark/5 text-v-dark/70 hover:bg-v-dark/10'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setStep(2)} className="rounded-xl bg-v-dark/5 px-4 py-2">
                Back
              </button>
              <button
                disabled={!mood}
                onClick={() => { window.location.href = '/dashboard' }}
                className="rounded-xl bg-v-ceil px-5 py-3 font-manrope font-semibold text-white disabled:opacity-40"
              >
                Finish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
