import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  isSupabaseConfigured,
  supabaseAnonKey,
  supabaseServer,
  supabaseUrl,
} from '@/backend/lib/supabase-client'

const visitorCookieName = 'student_marketplace_visitor_id'
const visitorCookieMaxAge = 60 * 60 * 24 * 365
const visitorHeaderName = 'x-visitor-id'

type LikeRouteContext = {
  params: {
    id: string
  }
}

function createVisitorId() {
  return crypto.randomUUID()
}

function isValidVisitorId(value: string | undefined): value is string {
  return Boolean(value && /^[a-zA-Z0-9-]{16,128}$/.test(value))
}

function getVisitorId(request: Request): string {
  const headerVisitorId = request.headers.get(visitorHeaderName) ?? undefined
  if (isValidVisitorId(headerVisitorId)) {
    return headerVisitorId
  }

  const existing = cookies().get(visitorCookieName)?.value
  return isValidVisitorId(existing) ? existing : createVisitorId()
}

function jsonWithVisitorCookie(body: unknown, visitorId: string, status = 200) {
  const response = NextResponse.json(body, { status })
  response.cookies.set(visitorCookieName, visitorId, {
    httpOnly: true,
    maxAge: visitorCookieMaxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  return response
}

async function ensureAvailableListing(listingId: string) {
  const { data, error } = await supabaseServer
    .from('listings')
    .select('id')
    .eq('id', listingId)
    .eq('status', 'available')
    .maybeSingle()

  if (error) throw error
  return Boolean(data)
}

type LikeClient = typeof supabaseServer

async function getLikeState(
  listingId: string,
  visitorId: string,
  likeClient: LikeClient = supabaseServer
) {
  const [countResult, likedResult] = await Promise.all([
    likeClient
      .from('listing_likes')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listingId),
    likeClient
      .from('listing_likes')
      .select('id')
      .eq('listing_id', listingId)
      .eq('visitor_id', visitorId)
      .maybeSingle(),
  ])

  if (countResult.error) throw countResult.error
  if (likedResult.error) throw likedResult.error

  return {
    liked: Boolean(likedResult.data),
    likesCount: countResult.count ?? 0,
  }
}

function getListingId(params: LikeRouteContext['params']): string | null {
  const id = params.id
  if (typeof id !== 'string' || id.length === 0) {
    return null
  }

  return id
}

function getLikeClient(visitorId: string, requireServiceRole = false) {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return supabaseServer
  }

  if (requireServiceRole) {
    return null
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        [visitorHeaderName]: visitorId,
      },
    },
  })
}

function isMissingLikesTableError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'PGRST205'
  )
}

function likesTableMissingResponse() {
  return NextResponse.json(
    {
      error:
        'Listing likes are not set up yet. Apply infra/supabase/migrations/20260626000000_anonymous_listing_likes.sql in Supabase.',
    },
    { status: 503 }
  )
}

function serviceRoleMissingResponse() {
  return NextResponse.json(
    {
      error:
        'Product likes cannot be saved because SUPABASE_SERVICE_ROLE_KEY is missing in the server environment.',
    },
    { status: 503 }
  )
}

export async function GET(request: Request, { params }: LikeRouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  try {
    const listingId = getListingId(params)
    if (!listingId) {
      return NextResponse.json({ error: 'Listing id is required.' }, { status: 400 })
    }

    const visitorId = getVisitorId(request)
    const likeClient = getLikeClient(visitorId)
    if (!likeClient) {
      return serviceRoleMissingResponse()
    }

    const listingExists = await ensureAvailableListing(listingId)

    if (!listingExists) {
      return jsonWithVisitorCookie({ error: 'Listing was not found.' }, visitorId, 404)
    }

    const state = await getLikeState(listingId, visitorId, likeClient)
    return jsonWithVisitorCookie(state, visitorId)
  } catch (error) {
    if (isMissingLikesTableError(error)) {
      return likesTableMissingResponse()
    }

    console.error('Failed to load listing like state:', error)
    return NextResponse.json({ error: 'Failed to load likes.' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: LikeRouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  try {
    const listingId = getListingId(params)
    if (!listingId) {
      return NextResponse.json({ error: 'Listing id is required.' }, { status: 400 })
    }

    const visitorId = getVisitorId(request)
    const likeClient = getLikeClient(visitorId, true)
    if (!likeClient) {
      return serviceRoleMissingResponse()
    }

    const listingExists = await ensureAvailableListing(listingId)

    if (!listingExists) {
      return jsonWithVisitorCookie({ error: 'Listing was not found.' }, visitorId, 404)
    }

    const { error } = await likeClient
      .from('listing_likes')
      .upsert(
        {
          listing_id: listingId,
          visitor_id: visitorId,
        },
        { onConflict: 'listing_id,visitor_id' }
      )

    if (error) throw error

    const state = await getLikeState(listingId, visitorId, likeClient)
    return jsonWithVisitorCookie(state, visitorId)
  } catch (error) {
    if (isMissingLikesTableError(error)) {
      return likesTableMissingResponse()
    }

    console.error('Failed to like listing:', error)
    return NextResponse.json({ error: 'Failed to like listing.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: LikeRouteContext) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 })
  }

  try {
    const listingId = getListingId(params)
    if (!listingId) {
      return NextResponse.json({ error: 'Listing id is required.' }, { status: 400 })
    }

    const visitorId = getVisitorId(request)
    const likeClient = getLikeClient(visitorId, true)
    if (!likeClient) {
      return serviceRoleMissingResponse()
    }

    const { error } = await likeClient
      .from('listing_likes')
      .delete()
      .eq('listing_id', listingId)
      .eq('visitor_id', visitorId)

    if (error) throw error

    const state = await getLikeState(listingId, visitorId, likeClient)
    return jsonWithVisitorCookie(state, visitorId)
  } catch (error) {
    if (isMissingLikesTableError(error)) {
      return likesTableMissingResponse()
    }

    console.error('Failed to unlike listing:', error)
    return NextResponse.json({ error: 'Failed to unlike listing.' }, { status: 500 })
  }
}
