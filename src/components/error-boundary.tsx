import { useId } from 'react'
import { Link, useLocation } from 'react-router'

import { AlertIcon } from './icons/alert-icon'

export function ErrorBoundary() {
  const headingId = useId()
  // On / the product list is what crashed, so linking back to it would only
  // crash again
  const isHome = useLocation().pathname === '/'

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-xl bg-amber/15 text-amber">
        <AlertIcon className="size-8" />
      </span>

      <h2 id={headingId} className="mt-6 text-xl font-bold text-navy">
        Sorry, something went wrong.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Something stopped this page from loading.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-brand-strong px-6 py-3 text-sm font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
        {!isHome && (
          <Link
            to="/"
            className="rounded-xl border border-line bg-white px-6 py-3 text-sm font-semibold text-body"
          >
            Return to products
          </Link>
        )}
      </div>
    </section>
  )
}
