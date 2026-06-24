'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUserProfile } from '@/features/auth/api'
import { getModerationListings, updateListingModerationStatus } from '@/features/listings/api'
import type { Listing } from '@/features/shared/types'

type FilterStatus = Listing['status'] | 'all'

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Sold', value: 'sold' },
  { label: 'Removed', value: 'removed' },
]

function statusClasses(status: Listing['status']) {
  if (status === 'available') return 'bg-emerald-50 text-emerald-700'
  if (status === 'sold') return 'bg-blue-50 text-blue-700'
  return 'bg-red-50 text-red-700'
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function ModerationPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [message, setMessage] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  const loadListings = async () => {
    const profile = await getCurrentUserProfile()

    if (profile?.role !== 'admin') {
      setIsAdmin(false)
      setIsLoading(false)
      return
    }

    const moderationListings = await getModerationListings()
    setListings(moderationListings)
    setIsAdmin(true)
    setIsLoading(false)
  }

  useEffect(() => {
    loadListings()
  }, [])

  const filteredListings = useMemo(() => {
    if (filter === 'all') return listings
    return listings.filter((listing) => listing.status === filter)
  }, [filter, listings])

  const counts = useMemo(
    () => ({
      all: listings.length,
      available: listings.filter((listing) => listing.status === 'available').length,
      sold: listings.filter((listing) => listing.status === 'sold').length,
      removed: listings.filter((listing) => listing.status === 'removed').length,
    }),
    [listings]
  )

  const updateStatus = async (listingId: string, status: Listing['status']) => {
    setMessage('')
    setUpdatingId(listingId)
    const result = await updateListingModerationStatus(listingId, status)
    setUpdatingId('')

    if (!result.success) {
      setMessage(result.error || 'Failed to update listing.')
      return
    }

    setListings((currentListings) =>
      currentListings.map((listing) =>
        listing.id === listingId ? { ...listing, status } : listing
      )
    )
    setMessage('Listing status updated.')
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading moderation queue...</div>
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Admin access required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Sign in with an admin account to review listings.</p>
            <Link href="/auth/login?redirect=/admin/moderation">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Moderation</h1>
        <p className="mt-2 text-gray-600">Review marketplace listings and remove unsafe content.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {filters.map((item) => (
          <button
            className={[
              'rounded-lg border px-4 py-3 text-left transition',
              filter === item.value
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50',
            ].join(' ')}
            key={item.value}
            onClick={() => setFilter(item.value)}
            type="button"
          >
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="mt-1 block text-2xl font-bold">
              {counts[item.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {message ? (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      ) : null}

      <div className="space-y-4">
        {filteredListings.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
            <p className="text-lg font-medium text-gray-900">No listings in this queue</p>
          </div>
        ) : (
          filteredListings.map((listing) => (
            <Card key={listing.id}>
              <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr] lg:grid-cols-[180px_1fr_auto]">
                <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                  {listing.photos?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      alt={listing.title}
                      className="h-full w-full object-contain"
                      src={listing.photos[0]}
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-lg font-semibold text-gray-950">
                      {listing.title}
                    </h2>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusClasses(
                        listing.status
                      )}`}
                    >
                      {listing.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {listing.category} · SEK {listing.price.toFixed(0)} · Listed{' '}
                    {formatDate(listing.created_at)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Seller: {listing.seller?.full_name || 'Unknown seller'} ·{' '}
                    {listing.seller?.email || 'No email'}
                  </p>
                  <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                    {listing.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-1 lg:w-36">
                  {listing.status === 'available' ? (
                    <Link href={`/listing/${listing.id}`}>
                      <Button className="w-full" variant="outline">
                        View
                      </Button>
                    </Link>
                  ) : null}
                  {listing.status !== 'available' ? (
                    <Button
                      className="w-full"
                      disabled={updatingId === listing.id}
                      onClick={() => updateStatus(listing.id, 'available')}
                    >
                      Restore
                    </Button>
                  ) : null}
                  {listing.status !== 'removed' ? (
                    <Button
                      className="w-full border-red-200 text-red-700 hover:bg-red-50"
                      disabled={updatingId === listing.id}
                      onClick={() => updateStatus(listing.id, 'removed')}
                      variant="outline"
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
