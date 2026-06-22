'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser } from '@/features/auth/api'
import { supabase } from '@/lib/supabase-client'

type ContactSellerCardProps = {
  listingId: string
  listingTitle: string
  sellerId: string
}

type CurrentUser = {
  id: string
  email?: string
}

export default function ContactSellerCard({
  listingId,
  listingTitle,
  sellerId,
}: ContactSellerCardProps) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isContactLoading, setIsContactLoading] = useState(false)
  const [contactError, setContactError] = useState('')
  const [contactHref, setContactHref] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const authUser = await getCurrentUser()
      setUser(authUser ? { id: authUser.id, email: authUser.email || undefined } : null)
      setIsLoading(false)

      if (!authUser || authUser.id === sellerId) {
        return
      }

      setIsContactLoading(true)
      const sessionResult = await supabase.auth.getSession()
      const accessToken = sessionResult.data.session?.access_token

      if (!accessToken) {
        setContactError('Sign in again to contact this seller.')
        setIsContactLoading(false)
        return
      }

      const response = await fetch(`/api/listings/${listingId}/contact`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      const payload = (await response.json()) as { contactHref?: string; error?: string }

      if (!response.ok || !payload.contactHref) {
        setContactError(payload.error || 'Seller contact is not available.')
      } else {
        setContactHref(payload.contactHref)
      }

      setIsContactLoading(false)
    }

    loadUser()
  }, [listingId, sellerId])

  const contactStatus = useMemo(() => {
    if (contactError) return contactError
    if (isContactLoading) return 'Preparing seller contact...'
    return 'Send a message from your email account to arrange pickup and payment.'
  }, [contactError, isContactLoading])

  const canContact = Boolean(contactHref) && !isContactLoading

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact seller</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="w-full" disabled size="lg">
            Checking account...
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Contact seller</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Sign in with your student account to contact the seller.
          </p>
          <Link href={`/auth/login?redirect=/listing/${listingId}`}>
            <Button className="w-full" size="lg">
              Sign in to contact seller
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (user.id === sellerId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your listing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">This item is listed from your account.</p>
          <Link href="/profile">
            <Button className="w-full" variant="outline">
              View Profile
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Contact seller</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{contactStatus}</p>
        <a aria-disabled={!canContact} href={canContact ? contactHref : undefined}>
          <Button className="w-full" disabled={!canContact} size="lg">
            Email Seller
          </Button>
        </a>
      </CardContent>
    </Card>
  )
}
