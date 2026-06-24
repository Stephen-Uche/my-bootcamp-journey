import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getListingById } from '@/features/listings/api'
import ContactSellerCard from './ContactSellerCard'

type ListingDetailPageProps = {
  params: {
    id: string
  }
}

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

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = await getListingById(params.id)

  if (!listing || listing.status !== 'available') {
    notFound()
  }

  const photos = listing.photos?.filter(Boolean) || []
  const sellerName = listing.seller?.full_name || 'Student seller'
  const sellerUniversity = listing.seller?.university || 'Verified student'

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link className="text-sm font-medium text-blue-700 hover:text-blue-800" href="/browse">
          Back to browse
        </Link>
        <Link href="/post">
          <Button variant="outline">Post Item</Button>
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="space-y-4">
          {photos[0] ? (
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={listing.title}
                className="max-h-full max-w-full object-contain"
                src={photos[0]}
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
              No photo added
            </div>
          )}

          {photos.length > 1 ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.slice(1, 5).map((photo, index) => (
                <div
                  className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                  key={photo}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={`${listing.title} photo ${index + 2}`}
                    className="max-h-full max-w-full object-contain"
                    src={photo}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                  {listing.category}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium capitalize text-gray-700">
                  {formatLabel(listing.condition)}
                </span>
              </div>
              <CardTitle className="text-3xl leading-tight">{listing.title}</CardTitle>
              <p className="text-sm text-gray-500">Listed {formatDate(listing.created_at)}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-4xl font-bold text-blue-600">SEK {listing.price.toFixed(0)}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Status</p>
                  <p className="mt-1 font-medium capitalize text-gray-950">{listing.status}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-gray-500">Condition</p>
                  <p className="mt-1 font-medium capitalize text-gray-950">
                    {formatLabel(listing.condition)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContactSellerCard
            listingId={listing.id}
            listingTitle={listing.title}
            sellerId={listing.seller_id}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-gray-950">{sellerName}</p>
              <p className="mt-1 text-sm text-gray-600">{sellerUniversity}</p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line leading-7 text-gray-700">{listing.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Buying tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>Meet in a public campus location.</li>
              <li>Check the item before payment.</li>
              <li>Keep messages inside your student account.</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
