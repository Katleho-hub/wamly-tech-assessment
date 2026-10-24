import { useId } from 'react'

import { AlertIcon } from './components/icons/alert-icon'

export function ErrorPage() {
  const headingId = useId()

  return (
    <section
      aria-labelledby={headingId}
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center"
    >
      <AlertIcon className="size-28 text-(--brand-color)" strokeWidth="1.5" />

      <h2 id={headingId} className="mt-10 text-xl font-semibold">
        Sorry, something went wrong.
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-(--secondary-text)">
        Something stopped this page from loading.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          className="rounded-xl bg-(--brand-color) px-6 py-3 text-sm font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </div>
    </section>
  )
}
