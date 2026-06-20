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
      <section className="relative -mx-4 -mt-8 min-h-[560px] overflow-hidden bg-[url('/images/student-marketplace-hero.png')] bg-cover bg-center md:rounded-b-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/25" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-gray-50 to-transparent" />

        <div className="relative mx-auto flex min-h-[560px] max-w-7xl items-center px-4 py-16">
          <div className="max-w-2xl space-y-7">
            <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 shadow-sm">
              Student deals for dorm life, books, furniture, and tech
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold leading-tight text-gray-950 md:text-6xl">
                Student Marketplace
              </h1>
              <p className="max-w-xl text-lg leading-8 text-gray-700">
                Buy and sell useful campus items with verified students. Start with a student
                gmail.com account or approved student mail.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/signup">
              <Button size="lg" className="shadow-lg shadow-blue-600/20">
                Create Account
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="bg-white/90 backdrop-blur">
                Browse Listings
              </Button>
            </Link>
            </div>

            <div className="grid max-w-xl grid-cols-3 gap-3 pt-2">
              {[
                ['48h', 'fast campus handoff'],
                ['SEK', 'student-friendly pricing'],
                ['ID', 'student email access'],
              ].map(([value, label]) => (
                <div
                  className="rounded-lg border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur"
                  key={value}
                >
                  <p className="text-xl font-bold text-gray-950">{value}</p>
                  <p className="mt-1 text-xs text-gray-600">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Books', 'books'],
          ['Dorm furniture', 'furniture'],
          ['Electronics', 'electronics'],
          ['Kitchen gear', 'kitchen'],
        ].map(([label, category]) => (
          <Link
            className="group overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            href={`/browse?category=${category}`}
            key={label}
          >
            <div className="mb-6 h-1.5 w-16 rounded-full bg-emerald-500 transition group-hover:w-24" />
            <h2 className="text-lg font-semibold text-gray-950">{label}</h2>
            <p className="mt-2 text-sm text-gray-600">Find local student listings</p>
          </Link>
        ))}
      </section>

      <section>
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Latest Listings</h2>
            <p className="mt-1 text-sm text-gray-600">Fresh items from the student community.</p>
          </div>
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
