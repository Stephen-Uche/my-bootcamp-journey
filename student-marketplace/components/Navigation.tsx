'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getCurrentUserProfile, logout } from '@/features/auth/api'
import { supabase } from '@/lib/supabase-client'

type AuthUser = {
  email?: string | null
  role?: 'student' | 'admin'
}

export function Navigation() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        setUser(null)
        setLoading(false)
        return
      }

      const profile = await getCurrentUserProfile()
      setUser({ email: data.user.email, role: profile?.role || 'student' })
      setLoading(false)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
    setUser(null)
    setIsLoggingOut(false)
    window.location.href = '/'
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-blue-600">
          Student Marketplace
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/browse">
            <Button variant="ghost">Browse</Button>
          </Link>

          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : user ? (
            <>
              <Link href="/post">
                <Button>Post Item</Button>
              </Link>
              <Link href="/my-listings">
                <Button variant="ghost">My Listings</Button>
              </Link>
              {user.role === 'admin' ? (
                <Link href="/admin/moderation">
                  <Button variant="ghost">Admin</Button>
                </Link>
              ) : null}
              <Link href="/profile">
                <Button variant="outline">{user.email?.split('@')[0]}</Button>
              </Link>
              <Button disabled={isLoggingOut} onClick={handleLogout} variant="ghost">
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
