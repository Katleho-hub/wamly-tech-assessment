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
  const { cart, addProduct, busy, error } = useCartFlow()

  const cartProductIds = new Set(cart?.products.map((item) => item.productId))

  return (
    <section aria-labelledby={headingId} className="w-full">
      <h2 id={headingId} className="my-4 text-3xl font-bold">
        Products
      </h2>
      {productsQuery.isError && (
        <p role="alert" className="text-red-500">
          Error fetching products: {productsQuery.error.message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-red-500">
          Error updating cart: {error.message}
        </p>
      )}
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
                    inCart={cartProductIds.has(product.id)}
                    disabled={busy}
                    priority={index < PRIORITY_COUNT}
                    onAddToCart={() => addProduct(product.id)}
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
