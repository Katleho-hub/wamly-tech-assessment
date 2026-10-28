import type { QueryClient } from '@tanstack/react-query'
import { createBrowserRouter, type RouteObject } from 'react-router'

import { productsLoader } from './api/fakestore/products'
import CartPage from './cart.page'
import { ErrorBoundary } from './components/error-boundary'
import queryClient from './lib/query-client'
import NotFoundPage from './not-found.page'
import ProductsPage from './products.page'
import RootLayout from './root.layout'

// Exported so tests can mount the same routes in a memory router, with their
// own query client
export function createRoutes(queryClient: QueryClient): RouteObject[] {
  return [
    {
      path: '/',
      element: <RootLayout />,
      errorElement: <ErrorBoundary />,
      loader: productsLoader(queryClient),
      // The loader doesn't wait for anything, so this only shows for a tick
      HydrateFallback: () => null,
      children: [
        {
          errorElement: <ErrorBoundary />,
          children: [
            { index: true, element: <ProductsPage /> },
            { path: 'cart', element: <CartPage /> },
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ],
    },
  ]
}

export const router = createBrowserRouter(createRoutes(queryClient))
