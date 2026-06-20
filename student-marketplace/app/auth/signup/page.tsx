'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { signInWithGoogle } from '@/features/auth/api'

export default function SignupPage() {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleSignIn = async () => {
    setMessage('')
    setIsSubmitting(true)
    const result = await signInWithGoogle()
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Google sign-up failed.')
    }
  }

  return (
    <div className="-mx-4 -my-8 grid min-h-[calc(100vh-73px)] place-items-center bg-[linear-gradient(90deg,rgba(249,250,251,0.96),rgba(249,250,251,0.72)),url('/images/student-marketplace-hero.png')] bg-cover bg-center px-4 py-12">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-gray-900/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Create student account</CardTitle>
          <p className="text-sm text-gray-600">
            Sign up with your Google Mail account. Supabase will verify the account through Google,
            so no email token is needed.
          </p>
        </CardHeader>
        <CardContent>
          <Button className="h-12 w-full gap-3 bg-white text-gray-900 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50" disabled={isSubmitting} onClick={handleGoogleSignIn}>
            <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
              G
            </span>
            {isSubmitting ? 'Opening Google...' : 'Continue with Google'}
          </Button>

          {message ? <p className="mt-4 text-sm text-gray-700">{message}</p> : null}

          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link className="font-medium text-blue-600 hover:text-blue-700" href="/auth/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
