import { screen } from '@testing-library/react'

import { mockFakeStore } from './test/fake-store'
import { renderApp } from './test/render-app'

const homeLink = () => screen.getByRole('link', { name: 'wamlystore home' })
const cartLink = () => screen.getByRole('link', { name: /^Cart/ })
const backButton = () => screen.queryByRole('button', { name: 'Back' })

describe('routing', () => {
  beforeEach(() => {
    mockFakeStore()
  })

  it('shows the products at /, without a back button', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'Products' }),
    ).toBeInTheDocument()
    expect(backButton()).not.toBeInTheDocument()
    expect(cartLink()).not.toHaveAttribute('aria-current')
  })

  it('shows the cart at /cart, with a back button', async () => {
    renderApp('/cart')

    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Products' }),
    ).not.toBeInTheDocument()
    expect(backButton()).toBeInTheDocument()
    expect(cartLink()).toHaveAttribute('aria-current', 'page')
  })

  it('navigates between pages from the top nav', async () => {
    const { user, router } = renderApp('/')

    await user.click(cartLink())
    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cart')

    await user.click(homeLink())
    expect(router.state.location.pathname).toBe('/')
    expect(
      await screen.findByRole('heading', { name: 'Products' }),
    ).toBeInTheDocument()
  })

  it('goes back to the previous page', async () => {
    const { user, router } = renderApp('/')
    await user.click(cartLink())
    await user.click(homeLink())
    await user.click(cartLink())

    await user.click(backButton()!)

    // Back through history, not a fresh push: /cart is still ahead of it
    expect(router.state.location.pathname).toBe('/')
    expect(router.state.historyAction).toBe('POP')
    expect(backButton()).not.toBeInTheDocument()
  })

  it('goes home when the app was opened on another page', async () => {
    const { user, router } = renderApp('/cart')
    await screen.findByRole('heading', { name: 'Your cart is empty' })

    await user.click(backButton()!)

    expect(router.state.location.pathname).toBe('/')
    expect(router.state.historyAction).toBe('PUSH')
  })

  it('shows a not found page for unknown paths, with a way back', async () => {
    const { user, router } = renderApp('/nope')

    expect(
      await screen.findByRole('heading', { name: /trouble finding this page/ }),
    ).toBeInTheDocument()
    expect(backButton()).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Return to products' }))

    expect(router.state.location.pathname).toBe('/')
  })
})

describe('error page', () => {
  const PRODUCTS = /^\/products$/
  // An object instead of an array makes any page listing products throw
  const MALFORMED = { status: 200, body: {} }

  const errorHeading = () =>
    screen.findByRole('heading', { name: /something went wrong/ })
  const tryAgainButton = () => screen.getByRole('button', { name: 'Try again' })
  const productsLink = () =>
    screen.queryByRole('link', { name: 'Return to products' })

  beforeEach(() => {
    // React and React Router log the caught error
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('replaces a crashed product list, keeping the top nav, with only a retry', async () => {
    const store = mockFakeStore()
    store.failNext('GET', PRODUCTS, MALFORMED)
    renderApp('/')

    expect(await errorHeading()).toBeInTheDocument()
    expect(cartLink()).toBeInTheDocument()
    expect(tryAgainButton()).toBeInTheDocument()
    // Returning to the products would only crash again
    expect(productsLink()).not.toBeInTheDocument()
  })

  it('offers a way back to the products when another page crashes', async () => {
    const store = mockFakeStore()
    const { user } = renderApp('/')
    await user.click(await screen.findByRole('button', { name: /, Backpack$/ }))
    // The cart page refetches the products when it opens
    store.failNext('GET', PRODUCTS, MALFORMED)
    await user.click(await screen.findByRole('link', { name: 'Cart (1)' }))

    expect(await errorHeading()).toBeInTheDocument()
    expect(tryAgainButton()).toBeInTheDocument()
    expect(productsLink()).toBeInTheDocument()
  })
})
