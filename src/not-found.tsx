import { useId } from 'react'
import { Link } from 'react-router'

import { MissingPageIcon } from './components/icons/missing-page-icon'

export function NotFound() {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
    >
      <MissingPageIcon className="w-28 text-(--brand-color)" />

      <h2 id={headingId} className="mt-10 text-xl font-semibold">
        Hmm… we're having trouble finding this page.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-(--secondary-text)">
        It looks like you used an invalid link.
        <br />
        Please double-check the URL or head back to the shop to see all
        products.
      </p>

      <Link
        to="/"
        className="mt-8 rounded-xl bg-(--brand-color) px-6 py-3 text-sm font-semibold text-white"
      >
        Return to products
      </Link>
    </section>
  )
}
