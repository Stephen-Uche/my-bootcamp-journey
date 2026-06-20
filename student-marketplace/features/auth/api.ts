import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { LoginInput } from '@/features/shared/types'

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const origin = window.location.origin
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    })

    if (error) throw error
    return { success: true, url: data.url }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Google sign-in failed',
    }
  }
}

export async function login(_input?: LoginInput) {
  return signInWithGoogle()
}

export async function logout() {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Logout failed' }
  }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured) {
    return null
  }

  try {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user
  } catch {
    return null
  }
}
