import { useEffect, useState } from 'react'

/**
 * Session storage with one-time migration from old localStorage keys.
 * Keeps data shape identical; only storage medium changes (requirement).
 */
export function useSessionStorageState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial as T
    const ss = sessionStorage.getItem(key)
    if (ss) return JSON.parse(ss) as T
    const ls = localStorage.getItem(key) // migrate once if present
    return ls ? (JSON.parse(ls) as T) : initial
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(state))
      // Clean migrated local value to avoid divergence
      localStorage.removeItem(key)
    } catch {}
  }, [key, state])

  return [state, setState] as const
}
