import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'

import { CartIdProvider } from '../context/cart-id-provider'
import { routes } from '../router'

export function renderApp(path = '/') {
  // The cart id is persisted, so don't let one test's cart leak into the next
  localStorage.clear()

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const router = createMemoryRouter(routes, { initialEntries: [path] })

  render(
    <QueryClientProvider client={queryClient}>
      <CartIdProvider>
        <RouterProvider router={router} />
      </CartIdProvider>
    </QueryClientProvider>,
  )

  return { user: userEvent.setup(), router }
}
