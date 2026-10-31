import { useQuery } from '@tanstack/react-query'

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

export function useProductsQuery() {
  return useQuery({
    queryKey: ['products'],
    queryFn: getAllProducts,
  })
}

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => getProductById(id),
    enabled: Boolean(id),
  })
}
