'use client'

import { useEffect, useState } from 'react'

type ListingPhotoGalleryProps = {
  photos: string[]
  title: string
}

export default function ListingPhotoGallery({ photos, title }: ListingPhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const activePhoto = activeIndex === null ? null : photos[activeIndex]

  useEffect(() => {
    if (activeIndex === null) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null)
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((currentIndex) =>
          currentIndex === null ? currentIndex : Math.min(currentIndex + 1, photos.length - 1)
        )
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((currentIndex) =>
          currentIndex === null ? currentIndex : Math.max(currentIndex - 1, 0)
        )
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, photos.length])

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500">
        No photo added
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        aria-label={`Expand ${title} photo 1`}
        className="flex aspect-[4/3] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition hover:border-blue-400"
        onClick={() => setActiveIndex(0)}
        type="button"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={title} className="h-full w-full object-contain" src={photos[0]} />
      </button>

      {photos.length > 1 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.slice(1).map((photo, index) => {
            const photoIndex = index + 1

            return (
              <button
                aria-label={`Expand ${title} photo ${photoIndex + 1}`}
                className="flex aspect-square cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 transition hover:border-blue-400"
                key={photo}
                onClick={() => setActiveIndex(photoIndex)}
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`${title} photo ${photoIndex + 1}`}
                  className="h-full w-full object-contain"
                  src={photo}
                />
              </button>
            )
          })}
        </div>
      ) : null}

      {activePhoto ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/85 p-4"
          role="dialog"
        >
          <button
            aria-label="Close expanded photo"
            className="absolute inset-0 cursor-zoom-out"
            onClick={() => setActiveIndex(null)}
            type="button"
          />
          <div className="relative z-10 flex h-full max-h-[90vh] w-full max-w-6xl flex-col gap-3">
            <div className="flex justify-end">
              <button
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
                onClick={() => setActiveIndex(null)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${title} expanded photo ${(activeIndex ?? 0) + 1}`}
                className="max-h-full max-w-full object-contain"
                src={activePhoto}
              />
            </div>
            {photos.length > 1 ? (
              <div className="flex items-center justify-center gap-2">
                <button
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={activeIndex === 0}
                  onClick={() =>
                    setActiveIndex((currentIndex) =>
                      currentIndex === null ? currentIndex : Math.max(currentIndex - 1, 0)
                    )
                  }
                  type="button"
                >
                  Previous
                </button>
                <span className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900">
                  {(activeIndex ?? 0) + 1} / {photos.length}
                </span>
                <button
                  className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={activeIndex === photos.length - 1}
                  onClick={() =>
                    setActiveIndex((currentIndex) =>
                      currentIndex === null
                        ? currentIndex
                        : Math.min(currentIndex + 1, photos.length - 1)
                    )
                  }
                  type="button"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
