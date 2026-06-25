import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const isSupabaseConfigured =
  !supabaseUrl.includes('your-project.supabase.co') &&
  !supabaseUrl.includes('your-supabase-project-url') &&
  !supabaseAnonKey.includes('your-supabase-anon-key')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)
