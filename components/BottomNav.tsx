'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/dashboard', label: 'Home',      icon: 'home.png' },
  { href: '/exercises', label: 'Exercises', icon: 'exercises.png' },
  { href: '/tests',     label: 'Tests',     icon: 'tests.png' },
  { href: '/sleep',     label: 'Sleep',     icon: 'sleep.png' },
  { href: '/blog',      label: 'Blog',      icon: 'blog.png' },
] as const

export default function BottomNav() {
  const pathname = usePathname() || '/'
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-white/10
                 bg-white/80 backdrop-blur-md dark:bg-v-dark/80 dark:border-v-white/10"
    >
      {/* centered width + safe-area */}
      <div className="mx-auto w-full max-w-6xl px-2 sm:px-4 pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5">
          {items.map((it) => {
            const active = isActive(it.href)
            return (
              <li key={it.href} className="h-full">
                <Link
                  href={it.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex h-16 md:h-20 flex-col items-center justify-center
                              gap-1 rounded-none transition
                              focus:outline-none focus-visible:ring-2 focus-visible:ring-v-ceil/60
                              ${active
                                ? 'bg-v-ceil text-white'
                                : 'hover:bg-black/5 dark:hover:bg-white/10 text-v-dark dark:text-v-white'}`}
                >
                  {/* active top indicator */}
                  <span className={`absolute inset-x-0 top-0 h-0.5 ${active ? 'bg-white/80' : 'bg-transparent'}`} />

                  <Image
                    src={`/nav-bar-icons/${it.icon}`}
                    alt={it.label}
                    width={28}
                    height={28}
                    // smooth inactive → active transition + subtle glow
                    className={`h-7 w-7 md:h-8 md:w-8 select-none
                                ${active
                                  ? 'drop-shadow-[0_0_10px_rgba(101,146,225,0.6)]'
                                  : 'opacity-80 group-hover:opacity-100'}`}
                    priority={active}
                  />
                  <span className={`text-[10px] md:text-xs font-medium ${active ? 'text-white' : ''}`}>
                    {it.label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
