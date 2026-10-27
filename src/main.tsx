import './index.css'

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { defaultShouldDehydrateQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { CartIdProvider } from './context/cart-id-provider'
import queryClient from './lib/query-client'
import { router } from './router'

const persister = createAsyncStoragePersister({
  storage: window.localStorage,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        dehydrateOptions: {
          // Only the cart lives in the cache; everything else can be refetched
          shouldDehydrateQuery: (query) =>
            query.queryKey[0] === 'carts' && defaultShouldDehydrateQuery(query),
        },
      }}
    >
      <CartIdProvider>
        <RouterProvider router={router} />
      </CartIdProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>,
)
