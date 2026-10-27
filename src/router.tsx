import type { QueryClient } from '@tanstack/react-query'
import { createBrowserRouter, type RouteObject } from 'react-router'

import { productsLoader } from './api/fakestore/products'
import { ErrorBoundary } from './components/error-boundary'
import queryClient from './lib/query-client'
import ProductsPage from './products.page'
import RootLayout from './root.layout'

// Exported so tests can mount the same routes in a memory router, with their
// own query client
export function createRoutes(queryClient: QueryClient): RouteObject[] {
  return [
    {
      path: '/',
      Component: RootLayout,
      ErrorBoundary,
      loader: productsLoader(queryClient),
      // The loader doesn't wait for anything, so this only shows for a tick
      HydrateFallback: () => null,
      children: [
        {
          ErrorBoundary,
          children: [
            {
              index: true,
              Component: ProductsPage,
            },
            {
              path: 'cart',
              lazy: async () => ({
                Component: (await import('./cart.page')).default,
              }),
            },
            {
              path: '*',
              lazy: async () => ({
                Component: (await import('./not-found.page')).default,
              }),
            },
          ],
        },
      ],
    },
  ]
}

export const router = createBrowserRouter(createRoutes(queryClient))
