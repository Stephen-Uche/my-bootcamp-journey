'use client'

import { useEffect, useState } from 'react'

type LikeButtonProps = {
  listingId: string
  className?: string
}

type LikeState = {
  liked: boolean
  likesCount: number
}

type LikeError = {
  error?: string
}

const visitorStorageKey = 'student_marketplace_visitor_id'

function createBrowserVisitorId() {
  return crypto.randomUUID()
}

function getBrowserVisitorId() {
  try {
    const existing = window.localStorage.getItem(visitorStorageKey)
    if (existing) return existing

    const visitorId = createBrowserVisitorId()
    window.localStorage.setItem(visitorStorageKey, visitorId)
    return visitorId
  } catch {
    return createBrowserVisitorId()
  }
}

export default function LikeButton({ listingId, className = '' }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadLikeState() {
      try {
        const visitorId = getBrowserVisitorId()
        const response = await fetch(`/api/listings/${listingId}/like`, {
          cache: 'no-store',
          headers: {
            'x-visitor-id': visitorId,
          },
        })

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as LikeError | null
          setErrorMessage(data?.error || 'Likes are not available yet.')
          return
        }

        const data = (await response.json()) as LikeState
        if (!isMounted) return

        setLiked(data.liked)
        setLikesCount(data.likesCount)
        setErrorMessage('')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLikeState()

    return () => {
      isMounted = false
    }
  }, [listingId])

  async function toggleLike() {
    if (isSaving) return

    const nextLiked = !liked

    setIsSaving(true)
    setErrorMessage('')

    try {
      const visitorId = getBrowserVisitorId()
      const response = await fetch(`/api/listings/${listingId}/like`, {
        headers: {
          'x-visitor-id': visitorId,
        },
        method: nextLiked ? 'POST' : 'DELETE',
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as LikeError | null
        throw new Error(data?.error || 'Failed to save like')
      }

      const data = (await response.json()) as LikeState
      setLiked(data.liked)
      setLikesCount(data.likesCount)
    } catch (error) {
      console.error('Failed to update like:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Could not save like.')
    } finally {
      setIsSaving(false)
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      <button
        aria-label={liked ? 'Unlike listing' : 'Like listing'}
        aria-pressed={liked}
        className={[
          'inline-flex h-10 w-full min-w-[96px] items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          liked
            ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
            : 'border-slate-300 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700',
        ].join(' ')}
        disabled={isSaving || isLoading}
        onClick={toggleLike}
        type="button"
      >
        <span aria-hidden="true" className="text-base leading-none">
          {liked ? '\u2665' : '\u2661'}
        </span>
        <span>{isSaving ? 'Saving' : liked ? 'Liked' : 'Like'}</span>
        <span>{isLoading ? '-' : likesCount}</span>
      </button>
      {errorMessage ? (
        <p className="mt-1 text-center text-xs font-medium text-rose-700">{errorMessage}</p>
      ) : null}
    </div>
  )
}
