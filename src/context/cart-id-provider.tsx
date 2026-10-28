import { type ReactNode } from 'react'

import { useLocalStorage } from '../hooks/use-local-storage'
import { CartIdContext } from './cart-id-context'

export function CartIdProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartId] = useLocalStorage('cartId', null)

  return <CartIdContext value={{ cartId, setCartId }}>{children}</CartIdContext>
}
