import api, { HttpError } from '../../lib/api-client'

type Endpoints = '/products' | `/products/${number}`

export default async function fakeStoreApi<T>(
  endpoint: Endpoints,
  options?: RequestInit,
): Promise<T> {
  const data = await api<T>(`https://fakestoreapi.com${endpoint}`, options)

  if (data === null) {
    throw new HttpError(404, 'Not found')
  }

  return data
}
