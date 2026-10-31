import { createBrowserRouter, type RouteObject } from 'react-router'

import { ErrorPage } from './error-page'
import { Layout } from './layout'
import { ProductList } from './product-list'

// Exported so tests can mount the same routes in a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    ErrorBoundary: ErrorPage,
    children: [
      {
        ErrorBoundary: ErrorPage,
        children: [
          {
            index: true,
            Component: ProductList,
          },
          {
            path: 'cart',
            lazy: async () => ({
              Component: (await import('./cart-page')).CartPage,
            }),
          },
          {
            path: '*',
            lazy: async () => ({
              Component: (await import('./not-found')).NotFound,
            }),
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
