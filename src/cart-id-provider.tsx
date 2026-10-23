import { type ReactNode, useState } from 'react'

import { CartIdContext } from './cart-id-context'

export function CartIdProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useState<number | null>(null)

  return <CartIdContext value={{ cartId, setCartId }}>{children}</CartIdContext>
}
