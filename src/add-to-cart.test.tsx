import { dehydrate, QueryClient } from '@tanstack/react-query'
import {
  type PersistedClient,
  type Persister,
} from '@tanstack/react-query-persist-client'
import { act, screen, within } from '@testing-library/react'

import { mockFakeStore, NEW_CART_ID } from './test/fake-store'
import { renderApp } from './test/render-app'

const PRODUCTS = /^\/products$/
const CREATE_CART = /^\/carts$/
const UPDATE_CART = /^\/carts\/\d+$/

// Each card's button name ends with ", <product title>"
function addButton(title: string) {
  return screen.findByRole('button', { name: new RegExp(`, ${title}$`) })
}

function findAddedButton(title: string, quantity: number) {
  return screen.findByRole('button', {
    name: new RegExp(`^Added \\(${quantity}\\).*, ${title}$`),
  })
}

// The header's cart link shows the total quantity once the cart is saved
function findCartLink(count: number) {
  return screen.findByRole('link', { name: `Cart (${count})` })
}

describe('add to cart', () => {
  it('shows skeletons, then the products', async () => {
    mockFakeStore()
    renderApp()

    const products = screen.getByRole('region', { name: 'Products' })
    expect(within(products).getByRole('list')).toHaveAttribute(
      'aria-busy',
      'true',
    )

    expect(await addButton('Backpack')).toBeEnabled()
    expect(await addButton('Slim Fit T-Shirt')).toBeEnabled()
    expect(within(products).getByRole('list')).toHaveAttribute(
      'aria-busy',
      'false',
    )
  })

  it('shows an error when the products fail to load, and recovers on retry', async () => {
    const store = mockFakeStore()
    store.failNext('GET', PRODUCTS, { status: 500 })
    const { user } = renderApp()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load products",
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await addButton('Backpack')).toBeEnabled()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('creates a cart on the first add and reflects it on the card and in the cart', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    expect(await findCartLink(0)).toBeInTheDocument()

    await user.click(await addButton('Backpack'))

    expect(await findAddedButton('Backpack', 1)).toBeInTheDocument()
    expect(store.requests('POST', CREATE_CART)).toEqual([
      expect.objectContaining({
        body: { userId: 1, products: [{ productId: 1, quantity: 1 }] },
      }),
    ])

    await user.click(await findCartLink(1))

    expect(
      await screen.findByRole('heading', { name: 'Your cart (1 item)' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Backpack' }),
    ).toBeInTheDocument()
  })

  it('adds a second product to the same cart', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()

    await user.click(await addButton('Backpack'))
    await findCartLink(1)
    await user.click(await addButton('Slim Fit T-Shirt'))

    expect(await findAddedButton('Slim Fit T-Shirt', 1)).toBeInTheDocument()
    expect(await findCartLink(2)).toBeInTheDocument()
    expect(store.requests('POST', CREATE_CART)).toHaveLength(1)
    expect(store.requests('PUT', UPDATE_CART)).toEqual([
      {
        method: 'PUT',
        path: `/carts/${NEW_CART_ID}`,
        body: {
          userId: 1,
          products: [
            { productId: 1, quantity: 1 },
            { productId: 2, quantity: 1 },
          ],
        },
      },
    ])
  })

  it('increments the quantity when the same product is added again', async () => {
    mockFakeStore()
    const { user } = renderApp()

    await user.click(await addButton('Backpack'))
    await findCartLink(1)
    await user.click(await addButton('Backpack'))

    expect(await findAddedButton('Backpack', 2)).toBeInTheDocument()
    expect(await findCartLink(2)).toBeInTheDocument()
  })

  it('disables every add button while a request is in flight', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    const backpack = await addButton('Backpack')
    const shirt = await addButton('Slim Fit T-Shirt')
    const release = store.holdNext('POST', CREATE_CART)

    await user.click(backpack)

    expect(backpack).toHaveTextContent('Adding...')
    expect(backpack).toBeDisabled()
    expect(shirt).toBeDisabled()

    release()

    await findCartLink(1)
    expect(backpack).toBeEnabled()
    expect(shirt).toBeEnabled()
  })

  it('shows the error on the failing card only, and recovers on retry', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    store.failNext('POST', CREATE_CART, { status: 500 })

    await user.click(await addButton('Backpack'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't add to cart",
    )
    expect(screen.getAllByRole('alert')).toHaveLength(1)
    expect(await addButton('Backpack')).toHaveTextContent('Try again')
    expect(await addButton('Slim Fit T-Shirt')).toHaveTextContent('Add to cart')

    await user.click(await addButton('Backpack'))

    expect(await findAddedButton('Backpack', 1)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('recovers from a network failure on retry', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    store.failNext('POST', CREATE_CART, 'network')

    await user.click(await addButton('Backpack'))

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.click(await addButton('Backpack'))

    expect(await findAddedButton('Backpack', 1)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('cart page', () => {
  // Adds the backpack on the products page, then opens the cart page
  async function renderCartWithBackpack() {
    const store = mockFakeStore()
    const { user } = renderApp()
    await user.click(await addButton('Backpack'))
    await user.click(await findCartLink(1))
    await screen.findByRole('heading', { name: /^Your cart/ })

    async function backToProducts() {
      await user.click(screen.getByRole('button', { name: 'Back' }))
    }

    return { store, user, backToProducts }
  }

  const increase = () =>
    screen.getByRole('button', { name: 'Increase quantity, Backpack' })
  const decrease = () =>
    screen.getByRole('button', { name: 'Decrease quantity, Backpack' })

  it('shows the line total and the order summary', async () => {
    const { user } = await renderCartWithBackpack()

    await user.click(increase())

    expect(
      await screen.findByRole('heading', { name: 'Your cart (2 items)' }),
    ).toBeInTheDocument()
    const summary = screen.getByRole('complementary', {
      name: 'Order summary',
    })
    expect(within(summary).getByText('Subtotal (2 items)')).toBeInTheDocument()
    // 2 × 109.95
    expect(within(summary).getAllByText(/219[.,]90/)).toHaveLength(2)
    expect(screen.getByText(/109[.,]95 each/)).toBeInTheDocument()
  })

  it('updates the card quantity from the cart "+" button', async () => {
    const { user, backToProducts } = await renderCartWithBackpack()

    await user.click(increase())

    expect(await findCartLink(2)).toBeInTheDocument()
    await backToProducts()
    expect(await findAddedButton('Backpack', 2)).toBeInTheDocument()
  })

  it('empties the cart when the last unit is removed with "−"', async () => {
    const { user, backToProducts } = await renderCartWithBackpack()

    await user.click(decrease())

    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()
    expect(await findCartLink(0)).toBeInTheDocument()
    await backToProducts()
    expect(await addButton('Backpack')).toHaveTextContent('Add to cart')
  })

  it('removes every unit of a product with "Remove"', async () => {
    const { store, user } = await renderCartWithBackpack()
    await user.click(increase())
    await findCartLink(2)

    await user.click(
      screen.getByRole('button', { name: /^Remove\s*, Backpack$/ }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()
    expect(store.requests('PUT', UPDATE_CART).at(-1)?.body).toEqual({
      userId: 1,
      products: [],
    })
  })

  it('shows an error when an update fails', async () => {
    const { store, user } = await renderCartWithBackpack()
    store.failNext('PUT', UPDATE_CART, { status: 500 })

    await user.click(increase())

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't update your cart",
    )
    expect(await findCartLink(1)).toBeInTheDocument()
  })
})

describe('restoring a saved cart', () => {
  const SAVED_CART_ID = 7

  // A persister that holds a saved backpack cart until restore() is called
  function savedCartPersister() {
    const saved = new QueryClient()
    saved.setQueryData(['carts', SAVED_CART_ID], {
      id: SAVED_CART_ID,
      userId: 1,
      products: [{ productId: 1, quantity: 2 }],
    })
    const persisted: PersistedClient = {
      timestamp: Date.now(),
      buster: '',
      clientState: dehydrate(saved),
    }

    let restore!: () => void
    const restored = new Promise<void>((resolve) => (restore = resolve))
    const persister: Persister = {
      persistClient: () => {},
      restoreClient: () => restored.then(() => persisted),
      removeClient: () => {},
    }

    return {
      persister,
      restore: () =>
        act(async () => {
          restore()
          await restored
        }),
    }
  }

  it("doesn't show an empty cart while the saved cart is restored", async () => {
    mockFakeStore()
    const { persister, restore } = savedCartPersister()
    renderApp('/cart', { cartId: SAVED_CART_ID, persister })

    expect(
      await screen.findByRole('link', { name: 'Cart' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Your cart is empty' }),
    ).not.toBeInTheDocument()

    await restore()

    expect(
      await screen.findByRole('heading', { name: 'Your cart (2 items)' }),
    ).toBeInTheDocument()
    expect(await findCartLink(2)).toBeInTheDocument()
  })

  it('shows placeholders for the product details until the products load', async () => {
    const store = mockFakeStore()
    const releaseProducts = store.holdNext('GET', PRODUCTS)
    const { persister, restore } = savedCartPersister()
    const { user } = renderApp('/cart', { cartId: SAVED_CART_ID, persister })

    await restore()

    const cart = await screen.findByRole('region', {
      name: 'Your cart (2 items)',
    })
    expect(within(cart).getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.getByRole('complementary', { name: 'Order summary' }),
    ).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.queryByRole('heading', { name: 'Product 1' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('$0.00')).not.toBeInTheDocument()

    // The quantity only needs the cart, so it can change meanwhile
    await user.click(
      screen.getByRole('button', { name: 'Decrease quantity, Product 1' }),
    )
    expect(await findCartLink(1)).toBeInTheDocument()

    releaseProducts()

    expect(
      await screen.findByRole('heading', { name: 'Backpack' }),
    ).toBeInTheDocument()
    expect(within(cart).getByRole('list')).toHaveAttribute('aria-busy', 'false')
  })

  it('shows an error instead of the prices when the products fail, and recovers on retry', async () => {
    const store = mockFakeStore()
    store.failNext('GET', PRODUCTS, { status: 500 })
    const { persister, restore } = savedCartPersister()
    const { user } = renderApp('/cart', { cartId: SAVED_CART_ID, persister })

    await restore()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      "Couldn't load prices",
    )
    expect(
      screen.getByRole('heading', { name: 'Product 1' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Increase quantity, Product 1' }),
    ).toBeEnabled()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(
      await screen.findByRole('heading', { name: 'Backpack' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('fetching a saved cart', () => {
  const SAVED_CART_ID = 7
  // Without a persister nothing is restored, so the saved cart is fetched
  const GET_SAVED_CART = new RegExp(`^/carts/${SAVED_CART_ID}$`)

  it("doesn't show an empty cart until the fetch finishes", async () => {
    const store = mockFakeStore()
    const release = store.holdNext('GET', GET_SAVED_CART)
    renderApp('/cart', { cartId: SAVED_CART_ID })

    expect(
      await screen.findByRole('link', { name: 'Cart' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Your cart is empty' }),
    ).not.toBeInTheDocument()

    // The fake store doesn't keep carts, so the fetch finds nothing
    release()

    expect(
      await screen.findByRole('heading', { name: 'Your cart is empty' }),
    ).toBeInTheDocument()
    expect(await findCartLink(0)).toBeInTheDocument()
  })

  it("can't add until the fetch finishes, so it doesn't start a second cart", async () => {
    const store = mockFakeStore()
    const release = store.holdNext('GET', GET_SAVED_CART)
    renderApp('/', { cartId: SAVED_CART_ID })

    expect(await addButton('Backpack')).toBeDisabled()

    release()

    expect(await findCartLink(0)).toBeInTheDocument()
    expect(await addButton('Backpack')).toBeEnabled()
  })
})
