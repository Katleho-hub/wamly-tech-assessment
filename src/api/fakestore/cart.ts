import {
  skipToken,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import fakeStoreApi from './client'

// type inferred from the api response 'https://fakestoreapi.com/carts/1'
export type CartItem = {
  productId: number
  quantity: number
}

export type Cart = {
  id: number
  userId: number
  products: CartItem[]
}

export type NewCart = Omit<Cart, 'id'>

function fetchOptions(method: 'POST' | 'PUT', body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function getCartById(id: number) {
  return fakeStoreApi<Cart>(`/carts/${id}`)
}

function createCart(cart: NewCart) {
  return fakeStoreApi<Cart>('/carts', fetchOptions('POST', cart))
}

function updateCart({ id, ...cart }: Cart) {
  return fakeStoreApi<Cart>(`/carts/${id}`, fetchOptions('PUT', cart))
}

function deleteCart(id: number) {
  return fakeStoreApi<Cart | null>(`/carts/${id}`, { method: 'DELETE' })
}

// Shared by all cart mutations so callers can track them together
export const cartMutationKey = ['carts']

export function useCart(id: number | null) {
  const isIdValid = id != null

  return useQuery({
    queryKey: ['carts', id],
    queryFn: isIdValid ? () => getCartById(id) : skipToken,
    /**
     * The mutations populate the cache because fakeStore doesn't save writes.
     *
     * This must never be re-fetched (not even on invalidation), or the
     * server's unmodified (or missing) cart would overwrite it
     */
    staleTime: 'static',
    gcTime: Infinity,
  })
}

export function useCreateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cartMutationKey,
    mutationFn: createCart,
    onSuccess: (cart) => {
      queryClient.setQueryData(['carts', cart.id], cart)
    },
  })
}

export function useUpdateCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cartMutationKey,
    mutationFn: updateCart,
    onSuccess: (cart) => {
      queryClient.setQueryData(['carts', cart.id], cart)
    },
  })
}

export function useDeleteCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: cartMutationKey,
    mutationFn: deleteCart,
    onSuccess: (_, cartId) => {
      queryClient.removeQueries({ queryKey: ['carts', cartId] })
    },
  })
}
