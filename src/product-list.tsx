import { useId } from 'react'

import { useProducts } from './api/fakestore/products'
import { AlertIcon } from './components/icons/alert-icon'
import { ProductCard, ProductCardSkeleton } from './components/product-card'
import { useCartFlow } from './use-cart-flow'

// fakestore always returns 20 products; matching that keeps content below
// the grid from shifting when they arrive
const SKELETON_COUNT = 20
// Cards above the fold: two rows on mobile, the first row on desktop
const PRIORITY_COUNT = 4

export function ProductList() {
  const headingId = useId()
  const productsQuery = useProducts()
  const { cart, addProduct, busy } = useCartFlow()

  const cartQuantities = new Map(
    cart?.products.map((item) => [item.productId, item.quantity]),
  )

  return (
    <section aria-labelledby={headingId} className="w-full">
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
  const headingId = useId()

  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <AlertIcon className="size-28 text-(--brand-color)" strokeWidth="1.5" />

      <h2 id={headingId} className="mt-10 text-xl font-semibold">
        Couldn't load products. Check your connection.
      </h2>
      <button
        type="button"
        className="rounded-xl bg-(--brand-color) px-6 py-3 text-sm font-semibold text-white"
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  )
}
