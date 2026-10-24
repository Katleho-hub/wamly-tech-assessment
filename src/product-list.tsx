import { useId } from 'react'

import { useProducts } from './api/fakestore/products'
import { ProductCard, ProductCardSkeleton } from './product-card'
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
      </div>
    </section>
  )
}
