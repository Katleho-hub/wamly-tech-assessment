import { createBrowserRouter, type RouteObject } from 'react-router'

import { ErrorBoundary } from './components/error-boundary'
import ProductsPage from './products.page'
import RootLayout from './root.layout'

// Exported so tests can mount the same routes in a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary,
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

export const router = createBrowserRouter(routes)
