import { useId } from 'react'
import { Link } from 'react-router'

import { MissingPageIcon } from './components/icons/missing-page-icon'

export default function NotFoundPage() {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-xl bg-amber/15 text-amber">
        <MissingPageIcon className="size-8" />
      </span>

      <h2 id={headingId} className="mt-6 text-xl font-bold text-navy">
        Hmm… we're having trouble finding this page.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        It looks like you used an invalid link.
        <br />
        Please double-check the URL or head back to the shop to see all
        products.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-xl bg-brand-strong px-6 py-3 text-sm font-semibold text-white"
      >
        Return to products
      </Link>
    </section>
  )
}
