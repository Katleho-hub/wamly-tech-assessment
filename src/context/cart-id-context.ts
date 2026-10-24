import { createContext, use } from 'react'

// Only the cart id is shared here; the cart itself lives in the query cache
export type CartIdContextValue = {
  cartId: number | null
  setCartId: (id: number | null) => void
}

export const CartIdContext = createContext<CartIdContextValue | null>(null)

export function useCartId() {
  const context = use(CartIdContext)

  if (!context) {
    throw new Error('useCartId must be used inside CartIdProvider')
  }

  return context
}
