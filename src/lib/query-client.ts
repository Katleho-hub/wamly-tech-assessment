import { QueryClient } from '@tanstack/react-query'

import { HttpError } from './api-client'

export default new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof HttpError && error.status === 404) {
          return false
        }

        return failureCount < 3
      },
    },
  },
})
