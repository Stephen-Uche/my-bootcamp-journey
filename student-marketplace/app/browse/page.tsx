import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getListings } from '@/features/listings/api'

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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browse listings</h1>
          <p className="mt-2 text-gray-600">Find used student items by category or keyword.</p>
        </div>
        <Link href="/post">
          <Button>Post Item</Button>
        </Link>
      </div>

      <form className="grid gap-3 rounded-lg border border-gray-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          className="h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
          defaultValue={search}
          name="search"
          placeholder="Search title or description"
          type="search"
        />

        <select
          className="h-11 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
          defaultValue={category}
          name="category"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </option>
          ))}
        </select>

        <Button className="h-11" type="submit">
          Search
        </Button>
      </form>

      {listings.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-lg font-medium text-gray-900">No listings found</p>
          <p className="mt-2 text-sm text-gray-600">
            Try another search, or add the first item for this category.
          </p>
          <Link className="mt-5 inline-flex" href="/post">
            <Button>Post Your First Item</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Link key={listing.id} href={`/listing/${listing.id}`}>
              <Card className="h-full cursor-pointer transition-shadow hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{listing.title}</CardTitle>
                  <p className="text-sm text-gray-500">{listing.category}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-2xl font-bold text-blue-600">
                      SEK {listing.price.toFixed(0)}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm capitalize">
                      {listing.condition}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-gray-600">
                    {listing.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
