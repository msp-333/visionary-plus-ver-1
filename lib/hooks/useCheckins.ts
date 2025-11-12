'use client'

import { useEffect, useMemo, useState } from 'react'

export type Checkin = { date: string; mood: number } // mood: 1-5

const KEY = 'vp_checkins'

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function dateOffset(base: Date, days: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}
function toStr(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function useCheckins() {
  const [items, setItems] = useState<Checkin[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(KEY)
    if (raw) {
      try { setItems(JSON.parse(raw)) } catch {}
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(KEY, JSON.stringify(items))
  }, [items])

  const today = todayStr()
  const checkedToday = items.some(i => i.date === today)

  const streak = useMemo(() => {
    if (items.length === 0) return 0
    const set = new Set(items.map(i => i.date))
    let s = 0
    let d = new Date()
    while (set.has(toStr(d))) {
      s++
      d = dateOffset(d, -1)
    }
    return s
  }, [items])

  const last7 = useMemo(() => {
    const map = new Map(items.map(i => [i.date, i.mood]))
    const arr: { date: string; mood: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = dateOffset(new Date(), -i)
      const k = toStr(d)
      arr.push({ date: k, mood: map.get(k) ?? 0 })
    }
    return arr
  }, [items])

  function addCheckin(mood: number) {
    const t = todayStr()
    setItems(prev => {
      const filtered = prev.filter(i => i.date !== t)
      return [...filtered, { date: t, mood }].sort((a,b) => a.date.localeCompare(b.date))
    })
  }

  return { items, addCheckin, streak, last7, checkedToday }
}
