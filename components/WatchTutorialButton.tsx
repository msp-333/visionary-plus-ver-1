// components/WatchTutorialButton.tsx
'use client'
import Link from 'next/link'

export function WatchTutorialButton({ exerciseId }: { exerciseId: string }) {
  return (
    <Link
      href={`/exercises/${exerciseId}?tab=tutorial`}
      className="inline-flex items-center gap-2 rounded-xl bg-v-ceil px-4 py-2 
                 text-white shadow-sm transition hover:opacity-90 focus:outline-none
                 focus-visible:ring-2 focus-visible:ring-v-ceil/60"
      aria-label="Watch tutorial"
      data-testid="watch-tutorial-btn"
    >
      {/* simple play icon */}
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
      Watch Tutorial
    </Link>
  )
}
