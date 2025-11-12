'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export type BackButtonProps = {
  className?: string;
  onClick?: () => void;   // when provided: use this (e.g., step-back in flow)
  label?: string;
  disabled?: boolean;     // disable on first step, etc.
};

function BackButton({ className = '', onClick, label = 'Back', disabled = false }: BackButtonProps) {
  const router = useRouter();

  const base =
    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm ' +
    'ring-1 ring-white/15 text-white/85 hover:bg-white/10 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6592E1] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent';

  const handle = () => {
    if (disabled) return;
    if (onClick) return onClick();
    router.back();
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={`${base} ${className}`}
      aria-label={label}
      aria-disabled={disabled || undefined}
      disabled={disabled}
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default BackButton;
export { BackButton };
