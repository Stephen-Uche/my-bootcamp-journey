'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { requestSignupCode, signup } from '@/features/auth/api'
import { signupEmailSchema, signupSchema } from '@/features/shared/types'

type FormState = {
  email: string
  verificationToken: string
  password: string
  fullName: string
}

const initialFormState: FormState = {
  email: '',
  verificationToken: '',
  password: '',
  fullName: '',
}

export default function SignupPage() {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [message, setMessage] = useState('')
  const [hasCodeBeenSent, setHasCodeBeenSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCodeRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')

    const parsed = signupEmailSchema.safeParse({ email: form.email })
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message || 'Enter a valid Google Mail address.')
      return
    }

    setIsSubmitting(true)
    const result = await requestSignupCode(parsed.data)
    setIsSubmitting(false)

    if (!result.success) {
      setMessage(result.error || 'Could not send verification code.')
      return
    }

    setHasCodeBeenSent(true)
    setMessage('Verification email sent. Paste the 6-digit code or confirmation link below.')
  }

  const handleVerifiedSignup = async (event: FormEvent<HTMLFormElement>) => {
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
    setHasCodeBeenSent(false)
    setMessage('Account verified and created. You can now sign in.')
  }

  return (
    <div className="-mx-4 -my-8 grid min-h-[calc(100vh-73px)] place-items-center bg-[linear-gradient(90deg,rgba(249,250,251,0.96),rgba(249,250,251,0.72)),url('/images/student-marketplace-hero.png')] bg-cover bg-center px-4 py-12">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-2xl shadow-gray-900/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-2xl">Create student account</CardTitle>
          <p className="text-sm text-gray-600">
            Verify your Google Mail address before completing sign-up.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCodeRequest}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">
                Google Mail address
              </label>
              <input
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-blue-600"
                disabled={hasCodeBeenSent || isSubmitting}
                id="email"
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                type="email"
                value={form.email}
              />
              <p className="text-xs text-gray-500">Use gmail.com, googlemail.com, or gmail.se.</p>
            </div>

            {!hasCodeBeenSent ? (
              <Button className="w-full" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Sending code...' : 'Send Verification Code'}
              </Button>
            ) : null}
          </form>

          {hasCodeBeenSent ? (
            <form className="mt-5 space-y-4 border-t border-gray-200 pt-5" onSubmit={handleVerifiedSignup}>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="verificationCode">
                  Verification code or confirmation link
                </label>
                <textarea
                  className="min-h-24 w-full resize-y rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-blue-600"
                  id="verificationCode"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      verificationToken: event.target.value.trim(),
                    })
                  }
                  placeholder="Paste 000000 or https://.../auth/v1/verify?token=..."
                  required
                  value={form.verificationToken}
                />
                <p className="text-xs text-gray-500">
                  If your Supabase email shows a Confirm email address button, copy that link and
                  paste it here.
                </p>
              </div>

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
                {isSubmitting ? 'Verifying...' : 'Verify Code and Sign Up'}
              </Button>

              <button
                className="w-full text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={() => {
                  setHasCodeBeenSent(false)
                  setForm({ ...form, verificationToken: '' })
                  setMessage('')
                }}
                type="button"
              >
                Use another email
              </button>
            </form>
          ) : null}

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
