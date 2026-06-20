import { supabase } from '@/lib/supabase-client'
import type { SignupInput } from '@/features/shared/types'

export async function signup(input: SignupInput) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          university: input.email.split('@')[1],
        },
      },
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Signup failed' }
  }
}

export async function login(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { success: true, user: data.user }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' }
  }
}

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Logout failed' }
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) return null
    return data.user
  } catch {
    return null
  }
}
