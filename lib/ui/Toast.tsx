'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info';
type ToastItem = { id: number; kind: ToastKind; message: string };

const ToastCtx = createContext<{
  push: (kind: ToastKind, message: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, kind, message }]);
    // Auto-dismiss in 3.5s
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {/* Toast container */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[1000] flex w-full justify-center px-4">
        <div className="flex w-full max-w-md flex-col gap-2">
          {items.map((t) => (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ring-white/10
                ${t.kind === 'success' ? 'bg-emerald-500/15 text-emerald-100' :
                  t.kind === 'error' ? 'bg-red-500/15 text-red-100' :
                  'bg-white/10 text-white'}
              `}
            >
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return {
    success: (msg: string) => ctx.push('success', msg),
    error: (msg: string) => ctx.push('error', msg),
    info: (msg: string) => ctx.push('info', msg),
  };
}
