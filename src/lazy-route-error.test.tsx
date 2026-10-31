import { screen } from '@testing-library/react'

import { mockFakeStore } from './test/fake-store'
import { renderApp } from './test/render-app'

// Importing the cart page fails, like its chunk request does when offline
jest.mock('./cart-page', () => {
  throw new TypeError('Failed to fetch dynamically imported module')
})

it('shows the error page when a page fails to load', async () => {
  mockFakeStore()
  const { user } = renderApp('/')

  await user.click(screen.getByRole('link', { name: /^Cart/ }))

  expect(
    await screen.findByRole('heading', {
      name: 'Sorry, something went wrong.',
    }),
  ).toBeInTheDocument()
})
