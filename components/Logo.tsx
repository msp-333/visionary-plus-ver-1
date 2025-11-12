"use client"

import React, { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  href?: string
}

export default function Logo({ size = 'lg', href }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  // Map size variants to Tailwind classes
  const sizeClasses = {
    sm: 'h-16 size-16',   // 4rem
    md: 'h-20 size-20',   // 5rem
    lg: 'h-24 size-24',   // 6rem
    xl: 'h-30 size-30',   // 7.5rem
    '2xl': 'h-32 size-32', // 8rem
    '3xl': 'h-40 size-40', // 10rem
  }

  const currentSize = sizeClasses[size] || sizeClasses.lg

  const logoContent = (
    <>
      {imageError ? (
        // Fallback to text-based logo if image fails to load
        <div className="flex items-center gap-2">
          <div className={`rounded-full bg-v-ceil flex items-center justify-center ${currentSize}`}>
            <span className="font-manrope font-bold text-white">V</span>
          </div>
          <span className="font-manrope font-bold text-v-dark">Visionary+</span>
        </div>
      ) : (
        <div className="flex items-center">
          <img
            src="/images/visionary logo.png"
            alt="Visionary+ Logo"
            className={`${currentSize} w-auto object-contain`}
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </>
  )

  // If href is provided, wrap the logo in a link
  if (href) {
    return (
      <a href={href} className="inline-block">
        {logoContent}
      </a>
    )
  }

  // Otherwise return the logo without a link
  return logoContent
}