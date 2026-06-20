import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { SignupEmailInput, SignupInput } from '@/features/shared/types'

export async function requestSignupCode(input: SignupEmailInput) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: input.email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification code',
    }
  }
}

export async function signup(input: SignupInput) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: input.email,
      token: input.verificationCode,
      type: 'email',
    })

    if (verifyError) throw verifyError

    const { data, error } = await supabase.auth.updateUser({
      password: input.password,
      data: {
        full_name: input.fullName,
        university: 'Google Mail',
        verified_student: true,
      },
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' }
  }
}

export async function login(email: string, password: string) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured. Update .env.local first.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
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
