'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { getCurrentUser } from '@/backend/features/auth/api'
import { createFeedback, getMyFeedback } from '@/backend/features/feedback/api'
import { feedbackSchema, type UserFeedback } from '@/backend/features/shared/types'

type FeedbackForm = {
  rating: string
  category: 'bug' | 'idea' | 'marketplace' | 'account' | 'other'
  message: string
}

const initialForm: FeedbackForm = {
  rating: '5',
  category: 'idea',
  message: '',
}

const categories: FeedbackForm['category'][] = ['idea', 'bug', 'marketplace', 'account', 'other']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export default function FeedbackPage() {
  const [form, setForm] = useState<FeedbackForm>(initialForm)
  const [feedback, setFeedback] = useState<UserFeedback[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const loadFeedback = async () => {
      const user = await getCurrentUser()

      if (!user) {
        setIsSignedIn(false)
        setIsLoading(false)
        return
      }

      setIsSignedIn(true)
      setFeedback(await getMyFeedback())
      setIsLoading(false)
    }

    loadFeedback()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const parsed = feedbackSchema.safeParse({
      ...form,
      rating: Number(form.rating),
    })

    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Check your feedback.')
      return
    }

    setIsSubmitting(true)
    const result = await createFeedback(parsed.data)
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Failed to send feedback.')
      return
    }

    setForm(initialForm)
    setFeedback((currentFeedback) =>
      result.feedback ? [result.feedback, ...currentFeedback] : currentFeedback
    )
    setMessage('Thanks. Your feedback was sent.')
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading feedback...</div>
  }

  if (!isSignedIn) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Sign in to send feedback about the marketplace.</p>
            <Link href="/auth/login?redirect=/feedback">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback</h1>
        <p className="mt-2 text-gray-600">
          Share bugs, ideas, or marketplace issues so the MVP can improve.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Send feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="rating">
                  Rating
                </label>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                  id="rating"
                  onChange={(event) => setForm({ ...form, rating: event.target.value })}
                  value={form.rating}
                >
                  <option value="5">5 - Great</option>
                  <option value="4">4 - Good</option>
                  <option value="3">3 - Okay</option>
                  <option value="2">2 - Needs work</option>
                  <option value="1">1 - Problematic</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="category">
                  Category
                </label>
                <select
                  className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm capitalize outline-none focus:border-blue-600"
                  id="category"
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value as FeedbackForm['category'] })
                  }
                  value={form.category}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="message">
                Message
              </label>
              <textarea
                className="min-h-36 w-full resize-y rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                id="message"
                maxLength={1500}
                minLength={10}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                required
                value={form.message}
              />
            </div>

            {message ? <p className="text-sm text-gray-700">{message}</p> : null}

            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent feedback</CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-sm text-gray-600">No feedback sent yet.</p>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4" key={item.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium capitalize text-gray-950">
                      {item.category} · {item.rating}/5
                    </p>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-gray-600">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{item.message}</p>
                  <p className="mt-2 text-xs text-gray-500">Sent {formatDate(item.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
