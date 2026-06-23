import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { LoginInput, SignupInput, User } from '@/features/shared/types'

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

export async function getCurrentUserProfile(): Promise<User | null> {
  if (!isSupabaseConfigured) {
    return null
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.user.id)
      .single()

    if (error || !data) return null
    return data as User
  } catch {
    return null
  }
}
