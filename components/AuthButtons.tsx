'use client'
import { supabase } from '@/lib/supabaseClient'

export function LoginButtons() {
  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
              // make sure this matches your Pages subpath
              redirectTo: `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}`
            }
          })
        }
        className="rounded-lg bg-[#6592E1] px-4 py-2 text-white"
      >
        Sign in with GitHub
      </button>
      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}` }
          })
        }
        className="rounded-lg border border-white/20 px-4 py-2"
      >
        Sign in with Google
      </button>
    </div>
  )
}

export function LogoutButton() {
  return (
    <button
      onClick={() => supabase.auth.signOut()}
      className="rounded-lg bg-white/10 px-3 py-1.5"
    >
      Sign out
    </button>
  )
}
