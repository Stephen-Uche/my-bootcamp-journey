import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card'
import { getButtonClassName } from '@/frontend/components/ui/button'

const contactPhoneDisplay = '073 490 09 34'
const contactPhoneHref = 'tel:+46734900934'
const contactSmsHref = 'sms:+46734900934'

export const metadata = {
  title: 'Contact Student Marketplace',
  description: 'Contact Student Marketplace support by phone or SMS.',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-900 px-5 py-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-sky-200">
            Contact Student Marketplace
          </p>
          <h1 className="mt-2 text-3xl font-bold">Need help or want to ask about STMPS?</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Visitors can call or send a text message directly from their phone.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <a className={getButtonClassName({ className: 'h-12 w-full', size: 'lg' })} href={contactPhoneHref}>
            Call {contactPhoneDisplay}
          </a>
          <a
            className={getButtonClassName({
              className: 'h-12 w-full',
              size: 'lg',
              variant: 'outline',
            })}
            href={contactSmsHref}
          >
            Send SMS
          </a>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Contact details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Phone</p>
            <a className="mt-1 inline-flex text-lg font-semibold text-sky-700 hover:text-sky-900" href={contactPhoneHref}>
              {contactPhoneDisplay}
            </a>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            Use this contact for questions about the marketplace, listings, feedback, or demo access.
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link className={getButtonClassName({ variant: 'outline' })} href="/browse">
          Browse listings
        </Link>
        <Link className={getButtonClassName({ variant: 'ghost' })} href="/">
          Back home
        </Link>
      </div>
    </div>
  )
}
