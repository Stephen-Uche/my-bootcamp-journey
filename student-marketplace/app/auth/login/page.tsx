'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/features/auth/api'
import { loginSchema } from '@/features/shared/types'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Check your login details.')
      return
    }

    setIsSubmitting(true)
    const result = await login(parsed.data.email, parsed.data.password)
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Login failed.')
      return
    }

    setMessage('Signed in successfully.')
  }

  return (
    <div className="-mx-4 -my-8 grid min-h-[calc(100vh-73px)] place-items-center bg-[linear-gradient(90deg,rgba(249,250,251,0.96),rgba(249,250,251,0.72)),url('/images/student-marketplace-hero.png')] bg-cover bg-center px-4 py-12">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-gray-900/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <p className="text-sm text-gray-600">
            Continue with your verified Google Mail account.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {message ? <p className="text-sm text-gray-700">{message}</p> : null}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            Need an account?{' '}
            <Link className="font-medium text-blue-600 hover:text-blue-700" href="/auth/signup">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
