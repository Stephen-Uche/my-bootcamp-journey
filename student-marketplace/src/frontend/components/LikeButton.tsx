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

        if (!response.ok) return

        const data = (await response.json()) as LikeState
        if (!isMounted) return

        setLiked(data.liked)
        setLikesCount(data.likesCount)
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
    const previousLiked = liked
    const previousLikesCount = likesCount

    setLiked(nextLiked)
    setLikesCount((count) => Math.max(0, count + (nextLiked ? 1 : -1)))
    setIsSaving(true)

    try {
      const visitorId = getBrowserVisitorId()
      const response = await fetch(`/api/listings/${listingId}/like`, {
        headers: {
          'x-visitor-id': visitorId,
        },
        method: nextLiked ? 'POST' : 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to save like')

      const data = (await response.json()) as LikeState
      setLiked(data.liked)
      setLikesCount(data.likesCount)
    } catch (error) {
      console.error('Failed to update like:', error)
      setLiked(previousLiked)
      setLikesCount(previousLikesCount)
    } finally {
      setIsSaving(false)
      setIsLoading(false)
    }
  }

  return (
    <button
      aria-label={liked ? 'Unlike listing' : 'Like listing'}
      aria-pressed={liked}
      className={[
        'inline-flex h-10 min-w-[76px] items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
          : 'border-slate-300 bg-white text-slate-700 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700',
        className,
      ].join(' ')}
      disabled={isSaving}
      onClick={toggleLike}
      type="button"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {liked ? '\u2665' : '\u2661'}
      </span>
      <span>{isLoading ? '-' : likesCount}</span>
    </button>
  )
}
