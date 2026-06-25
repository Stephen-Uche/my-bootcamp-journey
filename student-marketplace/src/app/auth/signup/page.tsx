'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Button } from '@/frontend/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { signup } from '@/backend/features/auth/api'
import { signupSchema } from '@/backend/features/shared/types'

type FormState = {
  email: string
  password: string
  fullName: string
}

const initialFormState: FormState = {
  email: '',
  password: '',
  fullName: '',
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const parsed = signupSchema.safeParse(form)
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Check your signup details.')
      return
    }

    setIsSubmitting(true)
    const result = await signup(parsed.data)
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Signup failed.')
      return
    }

    setForm(initialFormState)
    setMessage('Account created. Check your email if Supabase confirmation is enabled.')
  }

  return (
    <div className="-mx-4 -my-8 grid min-h-[calc(100vh-73px)] place-items-center bg-[linear-gradient(90deg,rgba(249,250,251,0.96),rgba(249,250,251,0.72)),url('/images/student-marketplace-hero.png')] bg-cover bg-center px-4 py-12">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-gray-900/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Create student account</CardTitle>
          <p className="text-sm text-gray-600">
            Sign up with gmail.com or an approved student email address.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="fullName">
                Full name
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="fullName"
                minLength={2}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                required
                value={form.fullName}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                type="email"
                value={form.email}
              />
              <p className="text-xs text-gray-500">Use gmail.com, gmail.se, or student mail.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                Password
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                id="password"
                minLength={8}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
                type="password"
                value={form.password}
              />
            </div>

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

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
