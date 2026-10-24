import { type Cart, type NewCart } from '../api/fakestore/cart'
import { type Product } from '../api/fakestore/products'

export const products: Product[] = [
  {
    id: 1,
    title: 'Backpack',
    price: 109.95,
    description: 'A backpack',
    category: 'bags',
    image: 'https://fakestoreapi.com/img/backpack.png',
  },
  {
    id: 2,
    title: 'Slim Fit T-Shirt',
    price: 22.3,
    description: 'A t-shirt',
    category: 'clothing',
    image: 'https://fakestoreapi.com/img/shirt.png',
  },
]

export const NEW_CART_ID = 11

// A body lets a 200 fail too, by returning data in an unexpected shape
type Failure = { status: number; body?: unknown } | 'network'

type Request = { method: string; path: string; body: unknown }

// Stands in for fakestoreapi.com: serves the products and, like the real API,
// echoes writes back without persisting them.
export function mockFakeStore() {
  const requests: Request[] = []
  const failures: { method: string; path: RegExp; failure: Failure }[] = []

  // Holds the next matching response until the returned function is called
  const holds: { method: string; path: RegExp; gate: Promise<void> }[] = []

  function holdNext(method: string, path: RegExp) {
    let release!: () => void
    const gate = new Promise<void>((resolve) => (release = resolve))
    holds.push({ method, path, gate })
    return release
  }

  function failNext(method: string, path: RegExp, failure: Failure) {
    failures.push({ method, path, failure })
  }

  function respond(status: number, data: unknown) {
    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      text: () =>
        Promise.resolve(data === undefined ? '' : JSON.stringify(data)),
    } as unknown as Response)
  }

  const fetchMock = jest.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = new URL(
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url,
      ).pathname
      const method = (init?.method ?? 'GET').toUpperCase()
      const body: unknown = init?.body
        ? JSON.parse(init.body as string)
        : undefined
      requests.push({ method, path, body })

      const holdIndex = holds.findIndex(
        (h) => h.method === method && h.path.test(path),
      )
      if (holdIndex !== -1) {
        const [{ gate }] = holds.splice(holdIndex, 1)
        await gate
      }

      const failureIndex = failures.findIndex(
        (f) => f.method === method && f.path.test(path),
      )
      if (failureIndex !== -1) {
        const [{ failure }] = failures.splice(failureIndex, 1)
        return failure === 'network'
          ? Promise.reject(new TypeError('Failed to fetch'))
          : respond(failure.status, failure.body)
      }

      if (method === 'GET' && path === '/products') {
        return respond(200, products)
      }
      if (method === 'POST' && path === '/carts') {
        return respond(200, { id: NEW_CART_ID, ...(body as NewCart) })
      }
      if (method === 'PUT' && /^\/carts\/\d+$/.test(path)) {
        const id = Number(path.split('/').at(-1))
        return respond(200, { id, ...(body as Omit<Cart, 'id'>) })
      }
      if (method === 'DELETE' && /^\/carts\/\d+$/.test(path)) {
        return respond(200, null)
      }

      return respond(404, undefined)
    },
  )

  globalThis.fetch = fetchMock as typeof fetch

  return {
    failNext,
    holdNext,
    requests: (method: string, path: RegExp) =>
      requests.filter((r) => r.method === method && path.test(r.path)),
  }
}
