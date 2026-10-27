import { dehydrate, QueryClient } from '@tanstack/react-query'
import { type Persister } from '@tanstack/react-query-persist-client'
import { screen } from '@testing-library/react'

import { mockFakeStore } from './test/fake-store'
import { renderApp } from './test/render-app'

const homeLink = () => screen.getByRole('link', { name: 'wamlystore home' })
const cartLink = () => screen.getByRole('link', { name: /^Cart/ })
const backButton = () => screen.queryByRole('button', { name: 'Back' })
// The root loader holds back the first render for a tick
const findCartLink = () => screen.findByRole('link', { name: /^Cart/ })
const findBackButton = () => screen.findByRole('button', { name: 'Back' })

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

    await user.click(await findCartLink())
    expect(router.state.location.pathname).toBe('/cart')
    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()

    await user.click(homeLink())
    expect(router.state.location.pathname).toBe('/')
    expect(
      await screen.findByRole('heading', { name: 'Products' }),
    ).toBeInTheDocument()
  })

  it('goes back to the previous page', async () => {
    const { user, router } = renderApp('/')
    await user.click(await findCartLink())
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

    await user.click(await findBackButton())

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
    // A saved backpack cart, so the cart page lists products
    const saved = new QueryClient()
    saved.setQueryData(['carts', 7], {
      id: 7,
      userId: 1,
      products: [{ productId: 1, quantity: 1 }],
    })
    const persister: Persister = {
      persistClient: () => {},
      restoreClient: () =>
        Promise.resolve({
          timestamp: Date.now(),
          buster: '',
          clientState: dehydrate(saved),
        }),
      removeClient: () => {},
    }
    const store = mockFakeStore()
    store.failNext('GET', PRODUCTS, MALFORMED)
    renderApp('/cart', { cartId: 7, persister })

    expect(await errorHeading()).toBeInTheDocument()
    expect(tryAgainButton()).toBeInTheDocument()
    expect(productsLink()).toBeInTheDocument()
  })
})
