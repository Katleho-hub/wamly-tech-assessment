import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  type Persister,
  PersistQueryClientProvider,
} from '@tanstack/react-query-persist-client'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { CartIdProvider } from '../context/cart-id-provider'
import { createRoutes } from '../router'

type RenderAppOptions = {
  // A cart id saved by an earlier visit
  cartId?: number
  // Restores the query cache, like the app does on load
  persister?: Persister
}

export function renderApp(
  path = '/',
  { cartId, persister }: RenderAppOptions = {},
) {
  // The cart id is persisted, so don't let one test's cart leak into the next
  localStorage.clear()
  if (cartId != null) {
    localStorage.setItem('cartId', JSON.stringify(cartId))
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(createRoutes(queryClient), {
    initialEntries: [path],
  })

  const app = (
    <CartIdProvider>
      <RouterProvider router={router} />
    </CartIdProvider>
  )

  render(
    persister ? (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        {app}
      </PersistQueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>{app}</QueryClientProvider>
    ),
  )

  return { user: userEvent.setup(), router }
}
