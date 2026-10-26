import type { Cart } from '../api/fakestore/cart'

export function countItems(cart: Cart | undefined) {
  return cart?.products.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  testing linting rules
}
