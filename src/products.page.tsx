import { useId } from 'react'

import { useProductsQuery } from './api/fakestore/products'
import { AlertIcon } from './components/icons/alert-icon'
import { ProductCard, ProductCardSkeleton } from './components/product-card'
import { useCart } from './hooks/use-cart'

// fakestore always returns 20 products; matching that keeps content below
// the grid from shifting when they arrive
const SKELETON_COUNT = 20
// Cards above the fold: two rows on mobile, the first row on desktop
const PRIORITY_COUNT = 4

export default function ProductsPage() {
  const headingId = useId()
  const productsQuery = useProductsQuery()
  const { cart, addProduct, busy } = useCart()

  const cartQuantities = new Map(
    cart?.products.map((item) => [item.productId, item.quantity]),
  )

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="sr-only">
        Products
      </h2>

      <div className="mx-auto max-w-5xl">
        {productsQuery.isError && !productsQuery.data ? (
          <ProductsError onRetry={() => void productsQuery.refetch()} />
        ) : (
          <ul
            aria-busy={!productsQuery.data}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          >
            {productsQuery.data
              ? productsQuery.data.map((product, index) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      quantity={cartQuantities.get(product.id) ?? 0}
                      disabled={busy}
                      priority={index < PRIORITY_COUNT}
                      onAddToCart={(callbacks) =>
                        addProduct(product.id, callbacks)
                      }
                    />
                  </li>
                ))
              : Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <li key={`skeleton-${index}`}>
                    <ProductCardSkeleton />
                  </li>
                ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function ProductsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-16 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-xl bg-amber/15 text-amber">
        <AlertIcon className="size-8" />
      </span>

      <h2 className="mt-3 text-xl font-bold text-navy">
        Couldn't load products. Check your connection.
      </h2>
      <button
        type="button"
        className="rounded-xl bg-brand-strong px-6 py-3 text-sm font-semibold text-white"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  )
}
