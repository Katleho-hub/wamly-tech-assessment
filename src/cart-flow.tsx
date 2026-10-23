import { useProducts } from './api/fakestore/products'
import { useCartFlow } from './use-cart-flow'

export function CartFlow() {
  const { data: products } = useProducts()
  const { cart, busy, error, changeQuantity, removeCart } = useCartFlow()

  function titleFor(productId: number) {
    return (
      products?.find((p) => p.id === productId)?.title ?? `Product ${productId}`
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="my-4 text-3xl font-bold underline">Cart flow</div>

      <div className="flex flex-col gap-4">
        {!cart ? (
          <p>No cart yet. Add a product to create one.</p>
        ) : (
          <>
            <h2 className="text-2xl font-bold">Cart #{cart.id}</h2>

            {cart.products.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cart.products.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="truncate">{titleFor(item.productId)}</span>
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        className="rounded border px-2 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => changeQuantity(item.productId, -1)}
                      >
                        −
                      </button>
                      {item.quantity}
                      <button
                        type="button"
                        className="rounded border px-2 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => changeQuantity(item.productId, 1)}
                      >
                        +
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              className="self-start rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
              disabled={busy}
              onClick={removeCart}
            >
              Delete cart
            </button>
          </>
        )}
      </div>

      {busy && <p className="mt-4">Sending request...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error.message}</p>}
    </div>
  )
}
