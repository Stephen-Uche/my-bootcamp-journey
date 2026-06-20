import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { SignupEmailInput, SignupInput } from '@/features/shared/types'

function parseVerificationInput(input: string) {
  const value = input.trim()

  if (/^\d{6}$/.test(value)) {
    return { token: value, type: 'email' as const }
  }

  try {
    const url = new URL(value)
    const tokenHash = url.searchParams.get('token')
    const type = url.searchParams.get('type') || 'signup'

    if (tokenHash) {
      return { token_hash: tokenHash, type }
    }
  } catch {
    // The input is not a URL. Treat it as the raw token from the Supabase link.
  }

  return { token_hash: value, type: 'signup' as const }
}

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
    const verification = parseVerificationInput(input.verificationToken)
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: input.email,
      ...verification,
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
