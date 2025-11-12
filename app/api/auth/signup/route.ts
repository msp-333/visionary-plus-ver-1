import { NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid form.' }, { status: 400 })
  }

  // Demo signup: accept and set a session cookie
  const res = NextResponse.json({ ok: true })
  res.cookies.set('visionary_session', crypto.randomUUID(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
  return res
}
