import type { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'Student Marketplace',
  description: 'Buy and sell used items with verified students',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <footer className="mt-16 border-t border-slate-300 bg-slate-900 text-slate-100">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <div>
              <h2 className="text-lg font-bold">Student Marketplace</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                A practical campus marketplace for used student items, quick handoffs, and verified
                accounts.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">Search</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Browse listings</li>
                <li>Books</li>
                <li>Dorm furniture</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">Account</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Post item</li>
                <li>My listings</li>
                <li>Feedback</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-200">Trust</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Verified email access</li>
                <li>Public handoff guidance</li>
                <li>Admin moderation</li>
              </ul>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
