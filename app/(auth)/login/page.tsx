'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Logo from '@/components/Logo'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})
type Values = z.infer<typeof Schema>

export default function Login() {
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(Schema)
  })
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(values: Values) {
    setPending(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    })
    setPending(false)

    if (error) {
      setError(error.message || 'Failed to sign in')
      return
    }

    // Success — go to your app’s home/dashboard
    router.replace('/dashboard') // or: window.location.href = '/dashboard'
  }

  async function loginWithGithub() {
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${location.origin}/dashboard` } // or location.origin
    })
    if (error) setError(error.message)
    // Redirect happens via OAuth; no need to set pending here
  }

  return (
    // Dark page background
    <div className="grid min-h-dvh place-items-center bg-radial px-4">
      {/* Force this card to stay LIGHT even in dark mode */}
      <div
        className="w-full max-w-sm rounded-2xl border border-v-dark/10 bg-white p-8 shadow-soft dark:bg-white"
        style={{ colorScheme: 'light' }}
      >
        <Logo href="/" />
        <h1 className="mt-4 font-manrope text-2xl font-extrabold text-v-dark dark:text-v-dark">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-v-dark/70 dark:text-v-dark/70">
          Sign in to continue
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-v-dark/10 bg-white px-4 py-3 text-v-dark placeholder-v-dark/40 outline-none ring-v-ceil/30 transition-all duration-300 focus:ring-4 dark:bg-white dark:text-v-dark"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              autoComplete="current-password"
              {...register('password')}
              placeholder="Enter your password"
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
            {pending ? 'Signing in…' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={loginWithGithub}
            className="w-full rounded-xl border border-v-dark/10 bg-white px-5 py-3 font-manrope font-semibold text-v-dark shadow-soft transition hover:bg-v-dark/5"
          >
            Continue with GitHub
          </button>

          <div className="mt-2 text-center">
            <a href="/signup" className="text-sm text-v-dark/70 hover:underline dark:text-v-dark/70">
              No account? Create one
            </a>
          </div>
          <a href="/" className="mt-1 block text-center text-sm text-v-dark/70 hover:underline dark:text-v-dark/70">
            Back to Home
          </a>
        </form>
      </div>
    </div>
  )
}
