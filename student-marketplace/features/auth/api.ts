import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { LoginInput, SignupInput } from '@/features/shared/types'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return fallback
}

export async function signup(input: SignupInput) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          university: input.email.split('@')[1],
          verified_student: true,
        },
      },
    })

    if (error) throw error
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' }
  }
}

export async function login(input: LoginInput) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })

    if (error) throw error
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
  }
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

export async function ensureCurrentUserProfile() {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const user = await getCurrentUser()
    if (!user?.email) {
      return { success: false, error: 'Sign in before posting an item.' }
    }

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        full_name:
          typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : null,
        university: user.email.split('@')[1],
        verified_student: true,
      },
      { onConflict: 'id' }
    )

    if (error) throw error
    return { success: true, userId: user.id }
  } catch (error) {
    return { success: false, error: getErrorMessage(error, 'Failed to prepare user profile') }
  }
}
