'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // Handle logout functionality here
    // For now, we'll just redirect to the login page
    router.push('/login')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-v-ceil text-white focus:outline-none focus:ring-2 focus:ring-v-ceil focus:ring-offset-2"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <span className="font-medium">U</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-v-dark/70 hover:bg-v-dark/5 dark:text-v-white dark:hover:bg-v-white/10"
              role="menuitem"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}