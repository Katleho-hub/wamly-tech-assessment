import { createBrowserRouter, type RouteObject } from 'react-router'

import { CartPage } from './cart-page'
import { ErrorPage } from './error-page'
import { Layout } from './layout'
import { NotFound } from './not-found'
import { ProductList } from './product-list'

// Exported so tests can mount the same routes in a memory router
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
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

export const router = createBrowserRouter(routes)
