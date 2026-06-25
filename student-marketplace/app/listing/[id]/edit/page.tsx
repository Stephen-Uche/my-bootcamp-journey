'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/features/auth/api'
import { deleteListing, getListingById, updateListing, uploadListingPhoto } from '@/features/listings/api'
import { updateListingSchema } from '@/features/shared/types'

type EditListingPageProps = {
  params: {
    id: string
  }
}

type FormState = {
  title: string
  description: string
  category: string
  price: string
  condition: 'new' | 'like-new' | 'good' | 'fair'
  status: 'available' | 'sold' | 'removed'
}

const categories = ['books', 'furniture', 'electronics', 'clothing', 'kitchen', 'other']
const maxPhotos = 8

export default function EditListingPage({ params }: EditListingPageProps) {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    category: 'books',
    price: '',
    condition: 'good',
    status: 'available',
  })
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadListing = async () => {
      const user = await getCurrentUser()
      const listing = await getListingById(params.id)

      if (!user) {
        setMessage('Sign in before editing this listing.')
        setIsLoading(false)
        return
      }

      if (!listing) {
        setMessage('Listing was not found.')
        setIsLoading(false)
        return
      }

      if (listing.seller_id !== user.id) {
        setMessage('Only the seller can edit this listing.')
        setIsLoading(false)
        return
      }

      setSellerId(user.id)
      setExistingImageUrls(listing.photos?.filter(Boolean) || [])
      setForm({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: String(listing.price),
        condition: listing.condition as FormState['condition'],
        status: listing.status,
      })
      setIsLoading(false)
    }

    loadListing()
  }, [params.id])

  useEffect(() => {
    if (imageFiles.length === 0) {
      setImagePreviewUrls([])
      return
    }

    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls(objectUrls)

    return () => objectUrls.forEach((objectUrl) => URL.revokeObjectURL(objectUrl))
  }, [imageFiles])

  const addImageFiles = (files: FileList | null) => {
    if (!files) return
    const selectedFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    setImageFiles((currentFiles) =>
      [...currentFiles, ...selectedFiles].slice(0, Math.max(maxPhotos - existingImageUrls.length, 0))
    )
  }

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((currentUrls) =>
      currentUrls.filter((_, imageIndex) => imageIndex !== index)
    )
  }

  const removeImageFile = (index: number) => {
    setImageFiles((currentFiles) => currentFiles.filter((_, fileIndex) => fileIndex !== index))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!sellerId) {
      setMessage('Only the seller can edit this listing.')
      return
    }

    const parsed = updateListingSchema.safeParse({
      ...form,
      price: Number(form.price),
      imageUrl: '',
    })

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Check your listing details.')
      return
    }

    setIsSubmitting(true)

    if (parsed.data.status === 'removed') {
      const confirmed = window.confirm('Delete this listing permanently?')

      if (!confirmed) {
        setIsSubmitting(false)
        return
      }

      const deleteResult = await deleteListing(params.id)
      setIsSubmitting(false)

      if (!deleteResult.success) {
        setMessage(deleteResult.error || 'Failed to delete listing.')
        return
      }

      window.location.href = '/my-listings'
      return
    }

    const uploadedImageUrls: string[] = []
    for (const imageFile of imageFiles) {
      const uploadResult = await uploadListingPhoto(imageFile)
      if (!uploadResult.success || !uploadResult.url) {
        setIsSubmitting(false)
        setMessage(uploadResult.error || 'Failed to upload image.')
        return
      }
      uploadedImageUrls.push(uploadResult.url)
    }

    const result = await updateListing(params.id, {
      ...parsed.data,
      imageUrls: [...existingImageUrls, ...uploadedImageUrls],
      seller_id: sellerId,
    })
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Failed to update listing.')
      return
    }

    window.location.href =
      parsed.data.status === 'available' ? `/listing/${params.id}?updated=${Date.now()}` : '/my-listings'
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading listing...</div>
  }

  if (!sellerId) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cannot edit listing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">{message}</p>
            <Link href={message.startsWith('Sign in') ? `/auth/login?redirect=/listing/${params.id}/edit` : '/browse'}>
              <Button className="w-full">{message.startsWith('Sign in') ? 'Sign In' : 'Browse Listings'}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit listing</CardTitle>
          <p className="text-sm text-gray-600">Update item details, price, image, or status.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="title">
                Title
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="title"
                maxLength={120}
                minLength={3}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                required
                value={form.title}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="description">
                Description
              </label>
              <textarea
                className="min-h-32 w-full resize-y rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                id="description"
                maxLength={2000}
                minLength={10}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
                value={form.description}
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium" htmlFor="imageFile">
                Product photos
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50"
                  htmlFor="imageFile"
                >
                  <span className="font-medium text-gray-900">Choose from files</span>
                  <span className="mt-1 text-xs">Add up to {maxPhotos} total photos</span>
                </label>
                <label
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50"
                  htmlFor="cameraImage"
                >
                  <span className="font-medium text-gray-900">Take photo</span>
                  <span className="mt-1 text-xs">Opens camera on supported devices</span>
                </label>
              </div>
              <input
                accept="image/*"
                className="sr-only"
                id="imageFile"
                multiple
                onChange={(event) => addImageFiles(event.target.files)}
                type="file"
              />
              <input
                accept="image/*"
                capture="environment"
                className="sr-only"
                id="cameraImage"
                onChange={(event) => addImageFiles(event.target.files)}
                type="file"
              />
              {imageFiles.length > 0 ? (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <span className="truncate text-gray-700">
                    {imageFiles.length} new photo{imageFiles.length === 1 ? '' : 's'} selected
                  </span>
                  <button
                    className="font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => setImageFiles([])}
                    type="button"
                  >
                    Remove new
                  </button>
                </div>
              ) : null}
              {existingImageUrls.length > 0 || imagePreviewUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingImageUrls.map((imageUrl, index) => (
                    <div
                      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                      key={imageUrl}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`Current listing photo ${index + 1}`}
                        className="h-full w-full object-contain"
                        src={imageUrl}
                      />
                      <button
                        className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
                        onClick={() => removeExistingImage(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {imagePreviewUrls.map((imagePreviewUrl, index) => (
                    <div
                      className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-blue-200 bg-blue-50"
                      key={imagePreviewUrl}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt={`New listing preview ${index + 1}`}
                        className="h-full w-full object-contain"
                        src={imagePreviewUrl}
                      />
                      <button
                        className="absolute right-2 top-2 rounded-md bg-white/95 px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm hover:bg-white"
                        onClick={() => removeImageFile(index)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category">
                  Category
                </label>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                  id="category"
                  onChange={(event) => setForm({ ...form, category: event.target.value })}
                  value={form.category}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="condition">
                  Condition
                </label>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                  id="condition"
                  onChange={(event) =>
                    setForm({ ...form, condition: event.target.value as FormState['condition'] })
                  }
                  value={form.condition}
                >
                  <option value="new">New</option>
                  <option value="like-new">Like new</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="price">
                  Price SEK
                </label>
                <input
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                  id="price"
                  min="1"
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  required
                  type="number"
                  value={form.price}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="status">
                  Status
                </label>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                  id="status"
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as FormState['status'] })
                  }
                  value={form.status}
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                  <option value="removed">Delete listing</option>
                </select>
              </div>
            </div>

            {message ? <p className="text-sm text-gray-700">{message}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link href={`/listing/${params.id}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
