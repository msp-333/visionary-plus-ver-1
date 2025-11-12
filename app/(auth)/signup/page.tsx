'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Logo from '@/components/Logo'

const Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character')
})
type Values = z.infer<typeof Schema>

export default function Signup() {
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(Schema)
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  return (
    // Dark page background
    <div className="grid min-h-dvh place-items-center bg-radial px-4">
      {/* Force this card to stay LIGHT even in dark mode */}
      <div
        className="w-full max-w-sm rounded-2xl border border-v-dark/10 bg-white p-8 shadow-soft dark:bg-white"
        style={{ colorScheme: 'light' }} // keeps native controls (autofill, etc.) light on some browsers
      >
        <Logo size="md" href="/" />
        <h1 className="mt-4 font-manrope text-2xl font-extrabold text-v-dark dark:text-v-dark">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-v-dark/70 dark:text-v-dark/70">
          Start your Visionary+ journey
        </p>

        <form
          onSubmit={handleSubmit(async (values) => {
            setPending(true)
            setError(null)
            const res = await fetch('/api/auth/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values)
            })
            setPending(false)
            if (res.ok) {
              window.location.href = '/onboarding'
            } else {
              const data = await res.json().catch(() => ({}))
              setError(data.message ?? 'Failed to sign up')
            }
          })}
          className="mt-6 space-y-4"
        >
          <div>
            <input
              {...register('name')}
              placeholder="Enter your full name"
              autoComplete="name"
              className="w-full rounded-xl border border-v-dark/10 bg-white px-4 py-3 text-v-dark placeholder-v-dark/40 outline-none ring-v-ceil/30 transition-all duration-300 focus:ring-4 dark:bg-white dark:text-v-dark"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              type="email"
              {...register('email')}
              placeholder="Enter your email address"
              autoComplete="email"
              className="w-full rounded-xl border border-v-dark/10 bg-white px-4 py-3 text-v-dark placeholder-v-dark/40 outline-none ring-v-ceil/30 transition-all duration-300 focus:ring-4 dark:bg-white dark:text-v-dark"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              {...register('password')}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="w-full rounded-xl border border-v-dark/10 bg-white px-4 py-3 text-v-dark placeholder-v-dark/40 outline-none ring-v-ceil/30 transition-all duration-300 focus:ring-4 dark:bg-white dark:text-v-dark"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.password.message}</p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-v-ceil px-5 py-3 font-manrope font-semibold text-white shadow-soft transition hover:opacity-90 disabled:opacity-70"
          >
            {pending ? 'Creating…' : 'Create Account'}
          </button>

          <a href="/login" className="block text-center text-sm text-v-dark/70 hover:underline dark:text-v-dark/70">
            Already have an account? Sign in
          </a>
          <a href="/" className="mt-1 block text-center text-sm text-v-dark/70 hover:underline dark:text-v-dark/70">
            Back to Home
          </a>
        </form>
      </div>
    </div>
  )
}
