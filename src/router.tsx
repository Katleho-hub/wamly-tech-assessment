import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="text-3xl font-bold underline">Hello World</div>,
    children: [],
  },
])
