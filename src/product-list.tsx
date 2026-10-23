import { useProducts } from './api/fakestore/products'
import { useCartFlow } from './use-cart-flow'

export function ProductList() {
  const productsQuery = useProducts()
  const { addProduct, busy, error } = useCartFlow()

  return (
    <div>
      <div className="my-4 text-3xl font-bold underline">Products</div>
      {productsQuery.isError && (
        <div className="text-red-500">
          Error fetching products: {productsQuery.error.message}
        </div>
      )}
      {productsQuery.isPending && <div>Loading products...</div>}
      {error && (
        <div className="text-red-500">Error updating cart: {error.message}</div>
      )}
      {productsQuery.isSuccess && (
        <ul className="flex flex-col gap-2">
          {productsQuery.data.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4"
            >
              <span>
                {product.title} - ${product.price}
              </span>
              <button
                type="button"
                className="shrink-0 rounded border px-2 py-1 text-sm disabled:opacity-50"
                disabled={busy}
                onClick={() => addProduct(product.id)}
              >
                Add to cart
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
