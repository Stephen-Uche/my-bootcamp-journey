import { isSupabaseConfigured, supabase } from '@/backend/lib/supabase-client'
import type { FeedbackInput, UserFeedback } from '@/backend/features/shared/types'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return fallback
}

export async function createFeedback(input: FeedbackInput) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return { success: false, error: 'Sign in before sending feedback.' }
    }

    const { data, error } = await supabase
      .from('user_feedback')
      .insert([
        {
          user_id: userData.user.id,
          rating: input.rating,
          category: input.category,
          message: input.message,
          status: 'new',
        },
      ])
      .select()
      .single()

    if (error) throw error
    return { success: true, feedback: data as UserFeedback }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to send feedback'),
    }
  }
}

export async function getMyFeedback(): Promise<UserFeedback[]> {
  if (!isSupabaseConfigured) {
    return []
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return []
    }

    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error
    return (data || []) as UserFeedback[]
  } catch (error) {
    console.error('Failed to fetch feedback:', error)
    return []
  }
}
