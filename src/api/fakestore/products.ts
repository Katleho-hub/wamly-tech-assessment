import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'

import fakeStoreApi from './client'

export type Product = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
}

function getAllProducts() {
  return fakeStoreApi<Product[]>('/products')
}

function getProductById(id: number) {
  return fakeStoreApi<Product>(`/products/${id}`)
}

const productsQuery = queryOptions({
  queryKey: ['products'],
  queryFn: getAllProducts,
  staleTime: Infinity,
})

export function useProducts() {
  return useQuery(productsQuery)
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  })
}

// Starts fetching without holding up navigation, so the product list still
// shows its skeletons. A failure is left for useProducts to show and retry.
export function productsLoader(queryClient: QueryClient) {
  return () => {
    queryClient.query(productsQuery).catch(() => {})
    return null
  }
}
