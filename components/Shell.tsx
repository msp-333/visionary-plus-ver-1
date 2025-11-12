import Logo from './Logo'
import BottomNav from './BottomNav'

export default function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-radial">
      <header className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pt-[env(safe-area-inset-top)] flex items-center justify-between">
        <Logo />
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:pb-24">
        {children}
      </main>

      {/* Removed footer */}
      <BottomNav />
    </div>
  )
}
