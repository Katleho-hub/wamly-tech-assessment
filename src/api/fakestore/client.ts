import api, { HttpError } from '../../lib/api-client'

type Endpoints =
  '/products' | `/products/${number}` | '/carts' | `/carts/${number}`

export default async function fakeStoreApi<T>(
  endpoint: Endpoints,
  options?: RequestInit,
): Promise<T> {
  const data = await api<T>(`https://fakestoreapi.com${endpoint}`, options)

  /**
   * fakestore responds 200 with an empty body (products) or null (carts) for missing resources,
   * but DELETE legitimately responds with `null`, only GET is treated as a missing resource.
   *
   * The following get requests:
   * https://fakestoreapi.com/carts/124 // returns 200 with body null
   * https://fakestoreapi.com/products/100 // returns 200 with an empty body
   *
   */
  const method = (options?.method ?? 'GET').toUpperCase()
  if (data === null && method === 'GET') {
    throw new HttpError(404, 'Not found')
  }

  return data as T
}
