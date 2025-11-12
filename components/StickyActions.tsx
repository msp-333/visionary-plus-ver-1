import React from 'react'

type Props = {
  variant: 'setup' | 'run'
  backLabel?: string
  primaryLabel: string
  onBack?: () => void
  onPrimary: () => void
  extraAction?: { label: string; onClick: () => void }
}

export function StickyActions({
  variant,
  backLabel = 'Back',
  primaryLabel,
  onBack,
  onPrimary,
  extraAction,
}: Props) {
  return (
    <div
      role="group"
      aria-label={variant === 'run' ? 'Test controls' : 'Flow navigation'}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10 bg-[#041126]/95 backdrop-blur supports-[backdrop-filter]:bg-[#041126]/80"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        {onBack ? (
          <button
            onClick={onBack}
            className="min-h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6592E1]"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {backLabel}
          </button>
        ) : (
          <div className="flex-1" />
        )}

        {extraAction ? (
          <button
            onClick={extraAction.onClick}
            className="min-h-11 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6592E1]"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            {extraAction.label}
          </button>
        ) : null}

        <button
          onClick={onPrimary}
          className="min-h-11 rounded-xl bg-[#6592E1] px-5 py-2 text-sm font-medium text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#6592E1]"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  )
}
