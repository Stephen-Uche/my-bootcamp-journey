'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/features/auth/api'
import { getMyListings } from '@/features/listings/api'
import type { Listing } from '@/features/shared/types'

type ListingStatus = Listing['status'] | 'all'

const statusOptions: { label: string; value: ListingStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Sold', value: 'sold' },
  { label: 'Removed', value: 'removed' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatLabel(value: string) {
  return value.replaceAll('-', ' ')
}

function statusClasses(status: Listing['status']) {
  if (status === 'available') return 'bg-emerald-50 text-emerald-700'
  if (status === 'sold') return 'bg-blue-50 text-blue-700'
  return 'bg-gray-100 text-gray-700'
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [status, setStatus] = useState<ListingStatus>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const loadListings = async () => {
      const user = await getCurrentUser()

      if (!user) {
        setIsSignedIn(false)
        setIsLoading(false)
        return
      }

      const sellerListings = await getMyListings()
      setIsSignedIn(true)
      setListings(sellerListings)
      setIsLoading(false)
    }

    loadListings()
  }, [])

  const filteredListings = useMemo(() => {
    if (status === 'all') return listings
    return listings.filter((listing) => listing.status === status)
  }, [listings, status])

  const counts = useMemo(
    () => ({
      all: listings.length,
      available: listings.filter((listing) => listing.status === 'available').length,
      sold: listings.filter((listing) => listing.status === 'sold').length,
      removed: listings.filter((listing) => listing.status === 'removed').length,
    }),
    [listings]
  )

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading your listings...</div>
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Sign in to manage your listings.</p>
            <Link href="/auth/login?redirect=/my-listings">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="mt-2 text-gray-600">Manage your active, sold, and removed items.</p>
        </div>
        <Link href="/post">
          <Button>Post Item</Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {statusOptions.map((option) => (
          <button
            className={[
              'rounded-lg border px-4 py-3 text-left transition',
              status === option.value
                ? 'border-blue-600 bg-blue-50 text-blue-800'
                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50',
            ].join(' ')}
            key={option.value}
            onClick={() => setStatus(option.value)}
            type="button"
          >
            <span className="block text-sm font-medium">{option.label}</span>
            <span className="mt-1 block text-2xl font-bold">
              {counts[option.value as keyof typeof counts]}
            </span>
          </button>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-lg font-medium text-gray-900">No listings yet</p>
          <p className="mt-2 text-sm text-gray-600">Post your first item to start selling.</p>
          <Link className="mt-5 inline-flex" href="/post">
            <Button>Post Your First Item</Button>
          </Link>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-lg font-medium text-gray-900">No {status} listings</p>
          <p className="mt-2 text-sm text-gray-600">Choose another status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredListings.map((listing) => (
            <Card key={listing.id}>
              <div className="grid gap-4 p-4 sm:grid-cols-[150px_1fr]">
                <div className="overflow-hidden rounded-lg bg-gray-100">
                  {listing.photos?.[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      alt={listing.title}
                      className="aspect-[4/3] h-full w-full object-cover"
                      src={listing.photos[0]}
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-sm text-gray-500">
                      No photo
                    </div>
                  )}
                </div>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-gray-950">
                        {listing.title}
                      </h2>
                      <p className="mt-1 text-sm capitalize text-gray-500">
                        {listing.category} · {formatLabel(listing.condition)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusClasses(
                        listing.status
                      )}`}
                    >
                      {listing.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span className="text-xl font-bold text-blue-600">
                      SEK {listing.price.toFixed(0)}
                    </span>
                    <span>Listed {formatDate(listing.created_at)}</span>
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-gray-600">
                    {listing.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {listing.status === 'available' ? (
                      <Link href={`/listing/${listing.id}`}>
                        <Button variant="outline">View</Button>
                      </Link>
                    ) : null}
                    <Link href={`/listing/${listing.id}/edit`}>
                      <Button>Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
