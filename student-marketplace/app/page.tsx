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
    <div className="space-y-3">
      {listings.map((listing) => (
        <Link key={listing.id} href={`/listing/${listing.id}`}>
          <Card className="cursor-pointer transition hover:border-sky-300 hover:shadow-md">
            <div className="grid gap-4 p-4 sm:grid-cols-[150px_1fr] lg:grid-cols-[170px_1fr_auto] lg:items-center">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-100">
                {listing.photos?.[0] ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    alt={listing.title}
                    className="h-full w-full object-contain"
                    src={listing.photos[0]}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    No photo
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <CardTitle className="line-clamp-1 text-lg">{listing.title}</CardTitle>
                <p className="mt-1 text-sm capitalize text-slate-500">
                  {listing.category} · {listing.condition}
                </p>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                  {listing.description}
                </p>
              </div>
              <div className="text-left sm:col-span-2 lg:col-span-1 lg:text-right">
                <p className="text-2xl font-bold text-sky-700">SEK {listing.price.toFixed(0)}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                  Available
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
              Search student listings
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Find campus items near you</h1>
          </div>
          <form className="grid gap-4 p-5 md:grid-cols-[1fr_190px_190px_auto]" action="/browse">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="home-search">
                Keyword
              </label>
              <input
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
                id="home-search"
                name="search"
                placeholder="Book, desk, headphones"
                type="search"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="home-category">
                Category
              </label>
              <select
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
                id="home-category"
                name="category"
              >
                <option value="">All categories</option>
                <option value="books">Books</option>
                <option value="furniture">Furniture</option>
                <option value="electronics">Electronics</option>
                <option value="kitchen">Kitchen</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="home-price">
                Price
              </label>
              <select
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
                id="home-price"
                name="price"
              >
                <option>Any price</option>
                <option>Under SEK 200</option>
                <option>Under SEK 500</option>
                <option>Under SEK 1000</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="h-11 w-full" type="submit">
                Search
              </Button>
            </div>
          </form>
          <div className="grid border-t border-slate-200 bg-slate-50 md:grid-cols-3">
            {[
              ['48h', 'fast campus handoff'],
              ['SEK', 'student-friendly pricing'],
              ['ID', 'student email access'],
            ].map(([value, label]) => (
              <div className="border-slate-200 p-5 md:border-r last:md:border-r-0" key={value}>
                <p className="text-2xl font-bold text-slate-950">{value}</p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-72 overflow-hidden rounded-md border border-slate-300 bg-[url('/images/student-marketplace-hero.png')] bg-cover bg-center shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
              Campus reuse
            </p>
            <h2 className="mt-2 text-2xl font-bold">Books, furniture, tech and kitchen gear</h2>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        {[
          ['Books', 'books'],
          ['Dorm furniture', 'furniture'],
          ['Electronics', 'electronics'],
          ['Kitchen gear', 'kitchen'],
        ].map(([label, category]) => (
          <Link
            className="group overflow-hidden rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-300 hover:shadow-md"
            href={`/browse?category=${category}`}
            key={label}
          >
            <div className="mb-5 h-1 w-14 rounded-full bg-sky-600 transition group-hover:w-24" />
            <h2 className="text-lg font-semibold text-slate-950">{label}</h2>
            <p className="mt-2 text-sm text-slate-600">Find local student listings</p>
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
