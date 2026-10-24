import { screen, within } from '@testing-library/react'

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
  })

  it('creates a cart on the first add and reflects it on the card and in the cart', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    expect(screen.getByText(/No cart yet/)).toBeInTheDocument()

    await user.click(await addButton('Backpack'))

    expect(
      await screen.findByRole('heading', { name: `Cart #${NEW_CART_ID}` }),
    ).toBeInTheDocument()
    expect(await addButton('Backpack')).toHaveTextContent(
      'Added (1) · Add another',
    )
    expect(store.requests('POST', CREATE_CART)).toEqual([
      expect.objectContaining({
        body: { userId: 1, products: [{ productId: 1, quantity: 1 }] },
      }),
    ])
  })

  it('adds a second product to the same cart', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()

    await user.click(await addButton('Backpack'))
    await findCartHeading()
    await user.click(await addButton('Slim Fit T-Shirt'))

    expect(
      await screen.findByRole('button', {
        name: /^Added \(1\) · Add another\s*, Slim Fit T-Shirt$/,
      }),
    ).toBeInTheDocument()
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
    await findCartHeading()
    await user.click(await addButton('Backpack'))

    expect(
      await screen.findByRole('button', { name: /^Added \(2\).*, Backpack$/ }),
    ).toBeInTheDocument()
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

    await findCartHeading()
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

    expect(await findCartHeading()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('recovers from a network failure on retry', async () => {
    const store = mockFakeStore()
    const { user } = renderApp()
    store.failNext('POST', CREATE_CART, 'network')

    await user.click(await addButton('Backpack'))

    expect(await screen.findByRole('alert')).toBeInTheDocument()

    await user.click(await addButton('Backpack'))

    expect(await findCartHeading()).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('cart edits reflected on the cards', () => {
  // The "+", "−" and "Delete cart" buttons only exist in the cart
  async function renderWithBackpackInCart() {
    mockFakeStore()
    const { user } = renderApp()
    await user.click(await addButton('Backpack'))
    await findCartHeading()
    return { user }
  }

  it('updates the card quantity from the cart "+" button', async () => {
    const { user } = await renderWithBackpackInCart()

    await user.click(screen.getByRole('button', { name: '+' }))

    expect(
      await screen.findByRole('button', { name: /^Added \(2\).*, Backpack$/ }),
    ).toBeInTheDocument()
  })

  it('resets the card when the item is removed with "−"', async () => {
    const { user } = await renderWithBackpackInCart()

    await user.click(screen.getByRole('button', { name: '−' }))

    expect(await screen.findByText('Cart is empty')).toBeInTheDocument()
    expect(await addButton('Backpack')).toHaveTextContent('Add to cart')
  })

  it('resets the cards when the cart is deleted', async () => {
    const { user } = await renderWithBackpackInCart()

    await user.click(screen.getByRole('button', { name: 'Delete cart' }))

    expect(await screen.findByText(/No cart yet/)).toBeInTheDocument()
    expect(await addButton('Backpack')).toHaveTextContent('Add to cart')
  })
})
