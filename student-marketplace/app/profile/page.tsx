'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, logout } from '@/features/auth/api'

type ProfileUser = {
  email?: string
  fullName?: string
  university?: string
  verifiedStudent?: boolean
  createdAt?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setShowWelcome(params.get('welcome') === '1')

    const loadUser = async () => {
      const authUser = await getCurrentUser()

      if (!authUser) {
        setUser(null)
        setIsLoading(false)
        return
      }

      setUser({
        email: authUser.email || undefined,
        fullName:
          typeof authUser.user_metadata?.full_name === 'string'
            ? authUser.user_metadata.full_name
            : undefined,
        university:
          typeof authUser.user_metadata?.university === 'string'
            ? authUser.user_metadata.university
            : undefined,
        verifiedStudent:
          typeof authUser.user_metadata?.verified_student === 'boolean'
            ? authUser.user_metadata.verified_student
            : undefined,
        createdAt: authUser.created_at,
      })
      setIsLoading(false)
    }

    loadUser()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    window.location.href = '/'
  }

  if (isLoading) {
    return <div className="py-16 text-center text-gray-600">Loading profile...</div>
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Sign in required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">Sign in to view your marketplace profile.</p>
            <Link href="/auth/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-gray-600">Manage your student marketplace account.</p>
      </div>

      {showWelcome ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
          Welcome back{user.fullName ? `, ${user.fullName}` : ''}. You are signed in.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="mt-1 text-gray-950">{user.fullName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="mt-1 text-gray-950">{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">School / domain</p>
              <p className="mt-1 text-gray-950">{user.university || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <p className="mt-1 text-gray-950">
                {user.verifiedStudent === false ? 'Unverified' : 'Student account'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row">
            <Link href="/post">
              <Button>Post Item</Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline">Browse Listings</Button>
            </Link>
            <Button disabled={isLoggingOut} onClick={handleLogout} variant="ghost">
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
