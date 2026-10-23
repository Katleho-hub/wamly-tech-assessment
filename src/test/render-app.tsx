import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { App } from '../app'
import { CartIdProvider } from '../cart-id-provider'

export function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <CartIdProvider>
        <App />
      </CartIdProvider>
    </QueryClientProvider>,
  )

  return { user: userEvent.setup() }
}
