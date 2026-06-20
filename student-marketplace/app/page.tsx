import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getListings } from '@/features/listings/api'

async function ListingsGrid() {
  const listings = await getListings({ limit: 12 })

  if (listings.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="mb-4 text-lg text-gray-600">No items available yet</p>
        <Link href="/post">
          <Button>Post Your First Item</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <Link key={listing.id} href={`/listing/${listing.id}`}>
          <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardHeader>
              <CardTitle className="line-clamp-2 text-lg">{listing.title}</CardTitle>
              <p className="text-sm text-gray-500">{listing.category}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-blue-600">
                  SEK {listing.price.toFixed(0)}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">
                  {listing.condition}
                </span>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-gray-600">{listing.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 py-12 text-white">
        <div className="mx-auto max-w-4xl space-y-4 px-4 text-center">
          <h1 className="text-4xl font-bold">Student Marketplace</h1>
          <p className="text-lg">Buy and sell used items with verified students</p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="bg-white text-blue-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Latest Listings</h2>
          <Link href="/browse">
            <Button variant="outline">Browse All</Button>
          </Link>
        </div>

        <Suspense fallback={<div className="py-12 text-center">Loading listings...</div>}>
          <ListingsGrid />
        </Suspense>
      </section>
    </div>
  )
}
