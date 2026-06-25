import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseServer } from '@/backend/lib/supabase-client'

type ContactRouteProps = {
  params: {
    id: string
  }
}

type ListingContactRow = {
  id: string
  title: string
  seller_id: string
  status: 'available' | 'sold' | 'removed'
  seller:
    | {
        email?: string | null
        full_name?: string | null
      }
    | null
}

export async function GET(request: NextRequest, { params }: ContactRouteProps) {
  const authorization = request.headers.get('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : ''

  if (!token) {
    return NextResponse.json({ error: 'Sign in before contacting the seller.' }, { status: 401 })
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'Sign in again to contact this seller.' }, { status: 401 })
  }

  const { data, error } = await supabaseServer
    .from('listings')
    .select('id, title, seller_id, status, seller:profiles(email, full_name)')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Listing was not found.' }, { status: 404 })
  }

  const listing = data as ListingContactRow

  if (listing.status !== 'available') {
    return NextResponse.json({ error: 'This listing is no longer available.' }, { status: 404 })
  }

  if (listing.seller_id === user.id) {
    return NextResponse.json({ error: 'This is your own listing.' }, { status: 400 })
  }

  if (!listing.seller?.email) {
    return NextResponse.json({ error: 'Seller contact is not available.' }, { status: 404 })
  }

  const sellerName = listing.seller.full_name || 'there'
  const subject = `Student Marketplace: ${listing.title}`
  const body = [
    `Hi ${sellerName},`,
    '',
    `I am interested in your listing: ${listing.title}`,
    `Listing ID: ${listing.id}`,
    user.email ? `You can reply to me at ${user.email}.` : '',
    '',
    'Is it still available?',
  ]
    .filter(Boolean)
    .join('\n')

  const contactHref = `mailto:${listing.seller.email}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`

  return NextResponse.json({ contactHref })
}
