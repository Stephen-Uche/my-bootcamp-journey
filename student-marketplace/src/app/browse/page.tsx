import Link from 'next/link'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { getListings } from '@/backend/features/listings/api'
import LikeButton from '@/frontend/components/LikeButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type BrowsePageProps = {
  searchParams?: {
    category?: string
    search?: string
  }
}

const categories = ['books', 'furniture', 'electronics', 'clothing', 'kitchen', 'other']

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const search = searchParams?.search?.trim() || ''
  const category = searchParams?.category?.trim() || ''
  const listings = await getListings({
    category: category || undefined,
    search: search || undefined,
    limit: 48,
  })

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-900 px-5 py-4 text-white md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">Search ads</p>
            <h1 className="mt-2 text-3xl font-bold">Browse listings</h1>
            <p className="mt-2 text-sm text-slate-300">Find used student items by category or keyword.</p>
          </div>
          <Link href="/post">
            <Button variant="secondary">Post Item</Button>
          </Link>
        </div>

        <form className="grid gap-4 p-5 md:grid-cols-[1fr_220px_180px_auto]">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="search">
              Keyword
            </label>
            <input
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              defaultValue={search}
              id="search"
              name="search"
              placeholder="Search title or description"
              type="search"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="category">
              Category
            </label>
            <select
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              defaultValue={category}
              id="category"
              name="category"
            >
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="sort">
              Sort
            </label>
            <select
              className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-sky-600"
              id="sort"
              name="sort"
            >
              <option>Newest first</option>
              <option>Lowest price</option>
              <option>Highest price</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button className="h-11 w-full" type="submit">
              Search
            </Button>
          </div>
        </form>
      </section>

      {listings.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-lg font-medium text-slate-900">No listings found</p>
          <p className="mt-2 text-sm text-slate-600">
            Try another search, or add the first item for this category.
          </p>
          <Link className="mt-5 inline-flex" href="/post">
            <Button>Post Your First Item</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="transition hover:border-sky-300 hover:shadow-md">
              <div className="grid gap-4 p-4 sm:grid-cols-[150px_1fr] lg:grid-cols-[170px_1fr_auto] lg:items-center">
                <div className="space-y-2">
                  <Link
                    aria-label={`View ${listing.title}`}
                    className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-md bg-slate-100"
                    href={`/listing/${listing.id}`}
                  >
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
                  </Link>
                  <LikeButton className="w-full" listingId={listing.id} />
                </div>
                <div className="min-w-0">
                  <CardTitle className="line-clamp-1 text-lg">
                    <Link className="hover:text-sky-700" href={`/listing/${listing.id}`}>
                      {listing.title}
                    </Link>
                  </CardTitle>
                  <p className="mt-1 text-sm capitalize text-slate-500">
                    {listing.category} · {listing.condition}
                  </p>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
                    {listing.description}
                  </p>
                </div>
                <div className="text-left sm:col-span-2 lg:col-span-1 lg:text-right">
                  <div>
                    <p className="text-2xl font-bold text-sky-700">
                      SEK {listing.price.toFixed(0)}
                    </p>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-emerald-700">
                      Available
                    </p>
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
