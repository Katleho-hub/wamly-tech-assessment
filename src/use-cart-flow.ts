import { useIsMutating, useMutationState } from '@tanstack/react-query'

import {
  type CartItem,
  cartMutationKey,
  useCart,
  useCreateCart,
  useUpdateCart,
} from './api/fakestore/cart'
import { useCartId } from './context/cart-id-context'

export type CartActionCallbacks = {
  onSuccess?: () => void
  onError?: () => void
}

// Cart state and actions. The cart id comes from CartIdProvider, the mutations
// seed the query cache, and useCart reads the cart back from it.
export function useCartFlow() {
  const { cartId, setCartId } = useCartId()

  const { data: cart } = useCart(cartId)
  const createCart = useCreateCart()
  const updateCart = useUpdateCart()

  // Counts cart mutations from every component, not just this hook call
  const busy = useIsMutating({ mutationKey: cartMutationKey }) > 0
  // Error of the most recent cart mutation from any component; clears once a
  // later mutation succeeds
  const error =
    useMutationState({
      filters: { mutationKey: cartMutationKey },
      select: (mutation) => mutation.state.error,
    }).at(-1) ?? null

  function saveProducts(
    nextProducts: CartItem[],
    callbacks: CartActionCallbacks = {},
  ) {
    if (!cart) return

    updateCart.mutate({ ...cart, products: nextProducts }, callbacks)
  }

  function changeQuantity(
    productId: number,
    delta: number,
    callbacks: CartActionCallbacks = {},
  ) {
    if (!cart) return

    const nextProducts = cart.products
      .map((p) =>
        p.productId === productId ? { ...p, quantity: p.quantity + delta } : p,
      )
      .filter((p) => p.quantity > 0)

    saveProducts(nextProducts, callbacks)
  }

  function addProduct(productId: number, callbacks: CartActionCallbacks = {}) {
    if (!cart) {
      createNewCart(productId, callbacks)
      return
    }

    const inCart = cart.products.some((p) => p.productId === productId)

    if (inCart) {
      changeQuantity(productId, 1, callbacks)
    } else {
      saveProducts([...cart.products, { productId, quantity: 1 }], callbacks)
    }
  }

  function createNewCart(productId: number, callbacks: CartActionCallbacks) {
    const newCart = { userId: 1, products: [{ productId, quantity: 1 }] }
    createCart.mutate(newCart, {
      onSuccess: ({ id }) => {
        setCartId(id)
        callbacks.onSuccess?.()
      },
      onError: callbacks.onError,
    })
  }

  function removeProduct(productId: number) {
    if (!cart) return

    saveProducts(cart.products.filter((p) => p.productId !== productId))
  }

  return {
    cart,
    busy,
    error,
    addProduct,
    changeQuantity,
    removeProduct,
  }
}
