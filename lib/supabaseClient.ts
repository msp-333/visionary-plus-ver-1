// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,      // add to GitHub → Settings → Secrets and variables → Actions
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!  // same as above
)
