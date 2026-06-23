
import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { CreateListingInput, Listing, UpdateListingInput } from '@/features/shared/types'

const listingImagesBucket = 'listing-images'

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return fallback
}

export async function uploadListingPhoto(file: File, sellerId: string) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const extension = file.name.split('.').pop() || 'jpg'
    const filePath = `${sellerId}/${crypto.randomUUID()}.${extension}`
    const { error } = await supabase.storage
      .from(listingImagesBucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage.from(listingImagesBucket).getPublicUrl(filePath)

    return { success: true, url: data.publicUrl }
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to upload image')
    if (message.toLowerCase().includes('bucket not found')) {
      return {
        success: false,
        error:
          'Image upload bucket not found. Create a public Supabase Storage bucket named listing-images.',
      }
    }

    return {
      success: false,
      error: message,
    }
  }
}

export async function getListings(
  filters?: {
    category?: string
    search?: string
    limit?: number
    offset?: number
  }
): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Update NEXT_PUBLIC_SUPABASE_URL in .env.local.')
    return []
  }

  try {
    let query = supabase.from('listings').select('*').eq('status', 'available')

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }

    if (filters?.search) {
      const search = filters.search.replaceAll('%', '\\%').replaceAll(',', '\\,')
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (filters?.limit) {
      const offset = filters.offset ?? 0
      query = query.range(offset, offset + filters.limit - 1)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Listing[]
  } catch (error) {
    console.error('Failed to fetch listings:', error)
    return []
  }
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Update NEXT_PUBLIC_SUPABASE_URL in .env.local.')
    return null
  }

  try {
    const result = await supabase
      .from('listings')
      .select('*, seller:profiles(id, email, full_name, university)')
      .eq('id', id)
      .single()

    if (!result.error) {
      return result.data as Listing
    }

    const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()
    if (error) throw error
    return data as Listing
  } catch (error) {
    console.error('Failed to fetch listing:', error)
    return null
  }
}

export async function getMyListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Update NEXT_PUBLIC_SUPABASE_URL in .env.local.')
    return []
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return []
    }

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', userData.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as Listing[]
  } catch (error) {
    console.error('Failed to fetch seller listings:', error)
    return []
  }
}

export async function createListing(input: CreateListingInput & { seller_id: string }) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          seller_id: input.seller_id,
          title: input.title,
          description: input.description,
          category: input.category,
          price: input.price,
          condition: input.condition,
          status: 'available',
          photos: input.imageUrl ? [input.imageUrl] : [],
        },
      ])
      .select()

    if (error) throw error
    return { success: true, listing: data?.[0] as Listing | undefined }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to create listing'),
    }
  }
}

export async function updateListing(
  id: string,
  input: UpdateListingInput & { seller_id: string }
) {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return { success: false, error: 'Sign in before updating this listing.' }
    }

    const updatePayload: {
      title: string
      description: string
      category: string
      price: number
      condition: string
      status: 'available' | 'sold' | 'removed'
      photos?: string[]
    } = {
      title: input.title,
      description: input.description,
      category: input.category,
      price: input.price,
      condition: input.condition,
      status: input.status,
    }

    if (input.imageUrl) {
      updatePayload.photos = [input.imageUrl]
    }

    const { data, error } = await supabase
      .from('listings')
      .update(updatePayload)
      .eq('id', id)
      .eq('seller_id', userData.user.id)
      .select()
      .single()

    if (error) throw error
    return { success: true, listing: data as Listing }
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error, 'Failed to update listing'),
    }
  }
}

export async function updateListingStatus(id: string, status: 'available' | 'sold' | 'removed') {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return { success: false, error: 'Sign in before updating this listing.' }
    }

    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)
      .eq('seller_id', userData.user.id)
      .select('id')
      .single()
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update listing',
    }
  }
}
