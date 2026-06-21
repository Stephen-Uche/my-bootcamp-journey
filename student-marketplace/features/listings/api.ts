
import { isSupabaseConfigured, supabase } from '@/lib/supabase-client'
import type { CreateListingInput, Listing } from '@/features/shared/types'

const listingImagesBucket = 'listing-images'

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
    const message = error instanceof Error ? error.message : 'Failed to upload image'
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
    const { data, error } = await supabase.from('listings').select('*').eq('id', id).single()

    if (error) throw error
    return data as Listing
  } catch {
    return null
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
      error: error instanceof Error ? error.message : 'Failed to create listing',
    }
  }
}

export async function updateListingStatus(id: string, status: 'available' | 'sold' | 'removed') {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Supabase is not configured.' }
  }

  try {
    const { error } = await supabase.from('listings').update({ status }).eq('id', id)
    if (error) throw error
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update listing',
    }
  }
}
