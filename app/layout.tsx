import './globals.css'
import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import QueryProvider from '@/components/QueryProvider' // ← if you use React Query

const manrope = Manrope({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Visionary+',
  description: 'Protect and improve your eyesight with science-backed exercises & tests',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
