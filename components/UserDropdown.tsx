'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type UserDropdownProps = {
  onLogout?: () => Promise<void> | void
  initials?: string
}

export default function UserDropdown({ onLogout, initials = 'U' }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemsRef = useRef<Array<HTMLButtonElement | null>>([])
  const router = useRouter()

  async function handleLogout() {
    try {
      if (onLogout) await onLogout()
      router.push('/login')
    } finally {
      closeMenu()
    }
  }

  const menuItems = [{ label: 'Logout', action: handleLogout }]

  function openMenu() {
    setIsOpen(true)
    setActiveIndex(0)
  }
  function closeMenu() {
    setIsOpen(false)
    setActiveIndex(0)
    buttonRef.current?.focus()
  }

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function onMenuKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!isOpen) return
    const last = menuItems.length - 1
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Home' || e.key === 'End') {
      e.preventDefault()
      let next = activeIndex
      if (e.key === 'ArrowDown') next = activeIndex === last ? 0 : activeIndex + 1
      if (e.key === 'ArrowUp') next = activeIndex === 0 ? last : activeIndex - 1
      if (e.key === 'Home') next = 0
      if (e.key === 'End') next = last
      setActiveIndex(next)
      itemsRef.current[next]?.focus()
    } else if (e.key === 'Tab') {
      setTimeout(() => {
        if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
          setIsOpen(false)
        }
      }, 0)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => (isOpen ? closeMenu() : openMenu())}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-v-ceil text-white outline-none ring-offset-2 transition
                   hover:brightness-95 focus-visible:ring-2 focus-visible:ring-v-ceil"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <span className="font-semibold">{initials}</span>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl border shadow-xl outline-none
                     animate-in fade-in zoom-in-95
                     border-v-dark/10 bg-white/95 backdrop-blur
                     dark:border-white/10 dark:bg-[#0b1a33]/95"
        >
          <div className="px-4 py-3 border-b border-v-dark/10 dark:border-white/10">
            <p className="text-xs uppercase tracking-wide text-v-dark/60 dark:text-white/60">Account</p>
          </div>

          <div className="py-1">
            {menuItems.map((item, i) => (
              <button
                key={item.label}
                ref={(el) => {
                  itemsRef.current[i] = el // <-- return void
                }}
                role="menuitem"
                onClick={item.action}
                onMouseEnter={() => setActiveIndex(i)}
                className={`block w-full px-4 py-2 text-left text-sm outline-none
                  ${i === activeIndex ? 'bg-v-ceil/10 dark:bg-white/10' : ''}
                  text-v-dark/80 hover:bg-v-ceil/10 focus:bg-v-ceil/15
                  dark:text-white/90 dark:hover:bg-white/10 dark:focus:bg-white/15`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
