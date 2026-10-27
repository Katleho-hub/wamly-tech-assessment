import type { QueryClient } from '@tanstack/react-query'
import { createBrowserRouter, type RouteObject } from 'react-router'

import { productsLoader } from './api/fakestore/products'
import { CartPage } from './cart-page'
import { ErrorPage } from './error-page'
import { Layout } from './layout'
import queryClient from './lib/query-client'
import { NotFound } from './not-found'
import { ProductList } from './product-list'

// Exported so tests can mount the same routes in a memory router, with their
// own query client
export function createRoutes(queryClient: QueryClient): RouteObject[] {
  return [
    {
      path: '/',
      element: <Layout />,
      errorElement: <ErrorPage />,
      loader: productsLoader(queryClient),
      // The loader doesn't wait for anything, so this only shows for a tick
      HydrateFallback: () => null,
      children: [
        {
          errorElement: <ErrorPage />,
          children: [
            { index: true, element: <ProductList /> },
            { path: 'cart', element: <CartPage /> },
            { path: '*', element: <NotFound /> },
          ],
        },
      ],
    },
  ]
}

export const router = createBrowserRouter(createRoutes(queryClient))
