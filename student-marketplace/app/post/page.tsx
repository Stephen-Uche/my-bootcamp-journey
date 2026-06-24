'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/features/auth/api'
import { createListing, uploadListingPhoto } from '@/features/listings/api'
import { createListingSchema } from '@/features/shared/types'

type FormState = {
  title: string
  description: string
  category: string
  price: string
  condition: 'new' | 'like-new' | 'good' | 'fair'
}

const categories = ['books', 'furniture', 'electronics', 'clothing', 'kitchen', 'other']

const initialFormState: FormState = {
  title: '',
  description: '',
  category: 'books',
  price: '',
  condition: 'good',
}

export default function PostPage() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [sellerId, setSellerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const user = await getCurrentUser()
      setSellerId(user?.id || null)
      setIsLoading(false)
    }

    loadUser()
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setImagePreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [imageFile])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    if (!sellerId) {
      setMessage('Sign in before posting an item.')
      return
    }

    const parsed = createListingSchema.safeParse({
      ...form,
      price: Number(form.price),
    })

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Check your listing details.')
      return
    }

    setIsSubmitting(true)

    let imageUrl = ''
    if (imageFile) {
      const uploadResult = await uploadListingPhoto(imageFile)
      if (!uploadResult.success) {
        setIsSubmitting(false)
        setMessage(uploadResult.error || 'Failed to upload image.')
        return
      }
      imageUrl = uploadResult.url || ''
    }

    const result = await createListing({
      ...parsed.data,
      imageUrl,
    })
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Failed to create listing.')
      return
    }

    setForm(initialFormState)
    setImageFile(null)
    setMessage('Listing created. It is now available in browse.')
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading...</div>
  }

  if (!sellerId) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Sign in before posting an item for sale.</p>
            <Link href="/auth/login">
              <Button className="w-full">Sign In</Button>
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
          <CardTitle className="text-2xl">Post an item</CardTitle>
          <p className="text-sm text-gray-600">
            Add the details students need to decide quickly.
          </p>
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
                Upload image
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5 text-center text-sm text-gray-600 transition hover:border-blue-500 hover:bg-blue-50"
                  htmlFor="imageFile"
                >
                  <span className="font-medium text-gray-900">Choose from files</span>
                  <span className="mt-1 text-xs">JPG, PNG, WebP, or HEIC</span>
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
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                type="file"
              />
              <input
                accept="image/*"
                capture="environment"
                className="sr-only"
                id="cameraImage"
                onChange={(event) => setImageFile(event.target.files?.[0] || null)}
                type="file"
              />
              {imageFile ? (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
                  <span className="truncate text-gray-700">{imageFile.name}</span>
                  <button
                    className="font-medium text-blue-600 hover:text-blue-700"
                    onClick={() => setImageFile(null)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ) : null}
              {imagePreviewUrl ? (
                <div className="flex h-56 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Listing preview"
                    className="max-h-full max-w-full object-contain"
                    src={imagePreviewUrl}
                  />
                </div>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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
                    setForm({
                      ...form,
                      condition: event.target.value as FormState['condition'],
                    })
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
            </div>

            {message ? <p className="text-sm text-gray-700">{message}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Posting...' : 'Post Item'}
              </Button>
              <Link href="/browse">
                <Button type="button" variant="outline">
                  Browse Listings
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
