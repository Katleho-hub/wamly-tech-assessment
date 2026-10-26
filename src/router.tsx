import { createBrowserRouter, type RouteObject } from 'react-router'

import CartPage from './cart.page'
import { ErrorBoundary } from './components/error-boundary'
import NotFoundPage from './not-found.page'
import ProductsPage from './products.page'
import RootLayout from './root.layout'

// Exported so tests can mount the same routes in a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorBoundary />,
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

export const router = createBrowserRouter(routes)
